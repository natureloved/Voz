import { NextResponse } from 'next/server';
import { tts } from '@/lib/elevenlabs';

export async function POST(req: Request) {
  try {
    const { text, language } = await req.json();

    if (!text || !language) {
      return NextResponse.json({ error: 'Missing text or language' }, { status: 400 });
    }

    const audioBuffer = await tts(text, language);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });

  } catch (error: any) {
    console.error("TTS API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
