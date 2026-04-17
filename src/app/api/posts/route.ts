import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || 'published';
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = `SELECT * FROM posts WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 0;

    if (status !== 'all') {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      sql += ` AND category = $${paramCount}`;
      params.push(category);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, offset);

    const posts = await query(sql, params);

    return NextResponse.json({ posts });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, slug, content, excerpt, featured_image, video_url, author, category, status } = await req.json();

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 });
    }

    const post = await queryOne<any>(`
      INSERT INTO posts (title, slug, content, excerpt, featured_image, video_url, author, category, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [title, slug, content, excerpt || null, featured_image || null, video_url || null, author || null, category || 'news', status || 'published']);

    return NextResponse.json({ post });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
