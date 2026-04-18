import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { query } from '@/lib/db';
import { sendObserverCredentials } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const electionId = searchParams.get('electionId');
    const status     = searchParams.get('status');

    let sql = 'SELECT * FROM observers WHERE 1=1';
    const params: unknown[] = [];
    let i = 1;
    if (electionId) { sql += ` AND election_id=$${i++}`; params.push(electionId); }
    if (status)     { sql += ` AND status=$${i++}`;      params.push(status); }
    sql += ' ORDER BY joined_at DESC';

    const observers = await query(sql, params);
    return NextResponse.json({ observers });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();

    // Resolve electionId safely
    let electionId: string | null = b.electionId ?? null;
    if (!electionId) {
      const elections = await query('SELECT id FROM elections LIMIT 1') as {id:string}[];
      electionId = elections[0]?.id ?? null;
    }

    // Auto-generate password if not provided
    const plainPassword = b.password || Math.random().toString(36).slice(-8) + 'G1!';
    const passwordHash  = createHash('sha256').update(plainPassword).digest('hex');

    // Fetch election name for email
    const [election] = electionId
      ? await query('SELECT name FROM elections WHERE id=$1', [electionId]) as {name:string}[]
      : [];

    const [row] = await query(`
      INSERT INTO observers
        (name, email, phone, cnic, polling_station_name, election_id, username, password_hash, photo_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
    `, [
      b.name, b.email, b.phone ?? null, b.cnic ?? null,
      b.pollingStationName ?? null, electionId,
      b.username ?? b.email, passwordHash, b.photoUrl ?? null,
    ]);

    // Send credentials email (best-effort, don't fail if SMTP not configured)
    try {
      await sendObserverCredentials({
        name:         b.name,
        email:        b.email,
        username:     b.username ?? b.email,
        password:     plainPassword,
        electionName: election?.name,
      });
    } catch (emailErr) {
      console.warn('[email] Failed to send credentials:', emailErr);
    }

    return NextResponse.json({ observer: row, passwordPlain: plainPassword }, { status: 201 });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
