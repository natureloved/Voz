import * as React from 'react';

export interface TranscribeResponse {
  text: string;
  language: 'en' | 'es';
  confidence: string;
  language_warning?: boolean;
}

export function useTranscribe() {
  const [isTranscribing, setIsTranscribing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const transcribe = React.useCallback(async (audioBlob: Blob): Promise<TranscribeResponse | null> => {
    setIsTranscribing(true);
    setError(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Transcription failed');
      }

      const data = await res.json();
      return data as TranscribeResponse;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsTranscribing(false);
    }
  }, []);

  return { transcribe, isTranscribing, error };
}
