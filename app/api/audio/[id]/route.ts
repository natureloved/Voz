import { kv, keys } from '@/lib/kv';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const audioB64 = (await kv.get(keys.audio(params.id))) as string | null;
    if (!audioB64) return new Response(null, { status: 404 });
    const buffer = Buffer.from(audioB64, 'base64');
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
