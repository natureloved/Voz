import * as React from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = React.useState(false);
  const [audioBlob, setAudioBlob] = React.useState<Blob | null>(null);
  const [analyser, setAnalyser] = React.useState<AnalyserNode | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const chunksRef = React.useRef<Blob[]>([]);
  const startTimeRef = React.useRef<number>(0);

  const startRecording = React.useCallback(async () => {
    try {
      setError(null);
      setAudioBlob(null);
      chunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyserNode = audioContext.createAnalyser();
      analyserNode.fftSize = 256;
      source.connect(analyserNode);
      setAnalyser(analyserNode);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      startTimeRef.current = Date.now();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Mic access denied:", err);
      setError("Microphone access denied. Please allow microphone permissions.");
    }
  }, []);

  const stopRecording = React.useCallback(() => {
    return new Promise<{ blob: Blob | null, duration: number }>((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        resolve({ blob: null, duration: 0 });
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const duration = Date.now() - startTimeRef.current;
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setIsRecording(false);

        // Cleanup tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(t => t.stop());
        setAnalyser(null);
        
        resolve({ blob, duration });
      };

      mediaRecorderRef.current.stop();
    });
  }, []);

  return {
    isRecording,
    audioBlob,
    analyser,
    error,
    startRecording,
    stopRecording,
  };
}
