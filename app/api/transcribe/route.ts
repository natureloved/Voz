import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
    }

    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json({ error: 'Missing ElevenLabs API Key' }, { status: 500 });
    }

    const scribeFormData = new FormData();
    scribeFormData.append('file', audioFile);
    scribeFormData.append('model_id', 'scribe_v1');

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': elevenLabsApiKey,
      },
      body: scribeFormData as any,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ElevenLabs Scribe Error:", errText);
      return NextResponse.json({ error: `STT Failed: ${response.statusText}` }, { status: response.status });
    }

    const data = await response.json();
    
    const text = data.text || '';
    // Scribe v1 language code detection mapping
    let detectedLanguage = data.language_code || 'en';
    let languageWarning = false;

    if (detectedLanguage !== 'en' && detectedLanguage !== 'es') {
      detectedLanguage = 'en';
      languageWarning = true;
    }

    return NextResponse.json({
      text,
      language: detectedLanguage,
      confidence: data.confidence || 'high',
      language_warning: languageWarning
    });

  } catch (error: any) {
    console.error("Transcribe API Error:", error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
