export async function tts(text: string, language: 'en' | 'es'): Promise<ArrayBuffer> {
  const voiceId = language === 'es' ? process.env.ELEVENLABS_VOICE_ID_ES : process.env.ELEVENLABS_VOICE_ID_EN;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey || !voiceId) throw new Error("ElevenLabs credentials missing");

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
    },
    body: JSON.stringify({
      text,
      model_id: language === 'es' ? 'eleven_multilingual_v2' : 'eleven_turbo_v2_5',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs TTS failed: ${await response.text()}`);
  }

  return response.arrayBuffer();
}
