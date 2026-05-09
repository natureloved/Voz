import { kv, keys } from '@/lib/kv';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const audioB64 = await kv.get<string>(keys.audio(params.id));
    if (!audioB64) return new Response(null, { status: 404 });
    const buffer = Buffer.from(audioB64, 'base64');
    return new Response(buffer, {
      headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}
