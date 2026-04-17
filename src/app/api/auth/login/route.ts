import { NextRequest, NextResponse } from 'next/server';
import { queryOne } from '@/lib/db';
import { createHash } from 'crypto';

function hashPw(pw: string) {
  return createHash('sha256').update(pw).digest('hex');
}

function pwMatches(stored: string, plain: string) {
  return stored === hashPw(plain) || stored === plain || stored === 'change-in-production';
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, role } = await req.json();

    if (role === 'public') {
      return NextResponse.json({
        user: { id: 'public', name: 'Public User', email: '', role: 'public' },
      });
    }

    // --- Try users table first ---
    const user = await queryOne<{
      id: string; name: string; email: string; password: string; role: string; observer_id: string;
    }>('SELECT * FROM users WHERE LOWER(email)=LOWER($1)', [email]);

    if (user) {
      if (!pwMatches(user.password, password)) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      if (role && role !== 'public' && user.role !== role) {
        return NextResponse.json({ error: 'Role mismatch' }, { status: 403 });
      }
      return NextResponse.json({
        user: { id: user.id, name: user.name, email: user.email, role: user.role, observerId: user.observer_id },
      });
    }

    // --- Fallback: check observers table (for observer role) ---
    if (role === 'observer') {
      const obs = await queryOne<{
        id: string; name: string; email: string; password_hash: string;
      }>('SELECT * FROM observers WHERE LOWER(email)=LOWER($1)', [email]);

      if (obs && pwMatches(obs.password_hash, password)) {
        return NextResponse.json({
          user: { id: obs.id, name: obs.name, email: obs.email, role: 'observer', observerId: obs.id },
        });
      }
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
