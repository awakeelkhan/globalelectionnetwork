import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

function toYouTubeEmbed(url: string): string {
  if (!url) return url;
  if (url.includes('/embed/')) return url;
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await queryOne<any>('SELECT * FROM posts WHERE id = $1', [params.id]);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, slug, content, excerpt, featured_image, video_url, author, category, status } = await req.json();

    const embedUrl = video_url ? toYouTubeEmbed(video_url) : null;

    const post = await queryOne<any>(`
      UPDATE posts 
      SET title = $1, slug = $2, content = $3, excerpt = $4, featured_image = $5, video_url = $6, author = $7, category = $8, status = $9, updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `, [title, slug, content, excerpt || null, featured_image || null, embedUrl, author || null, category || 'news', status || 'published', params.id]);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await queryOne<any>('DELETE FROM posts WHERE id = $1 RETURNING *', [params.id]);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (e: unknown) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
