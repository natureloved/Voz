import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Loader2, Check, AlertCircle } from 'lucide-react';
import { Waveform } from './Waveform';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useTranscribe, TranscribeResponse } from '@/hooks/useTranscribe';
import { cn } from '@/lib/cn';

type MicState = 'idle' | 'recording' | 'uploading' | 'transcribed' | 'error';

interface MicButtonProps {
  onTranscribe: (data: TranscribeResponse) => void;
}

export function MicButton({ onTranscribe }: MicButtonProps) {
  const [micState, setMicState] = React.useState<MicState>('idle');
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  
  const { startRecording, stopRecording, analyser, error: recError } = useVoiceRecorder();
  const { transcribe, error: transError } = useTranscribe();

  React.useEffect(() => {
    if (recError) {
      setMicState('error');
      setErrorMessage(recError);
    }
  }, [recError]);

  const handlePointerDown = async (e: React.PointerEvent) => {
    // only allow left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    if (micState === 'uploading' || micState === 'transcribed') return;
    
    setMicState('recording');
    setErrorMessage(null);
    await startRecording();
  };

  const handlePointerUp = async () => {
    if (micState !== 'recording') return;
    
    const { blob, duration } = await stopRecording();
    
    if (!blob || duration < 800) {
      setMicState('error');
      setErrorMessage("Recording too short. Please hold to speak.");
      setTimeout(() => setMicState('idle'), 3000);
      return;
    }

    setMicState('uploading');
    
    const result = await transcribe(blob);
    if (result) {
      setMicState('transcribed');
      onTranscribe(result);
      setTimeout(() => setMicState('idle'), 2000);
    } else {
      setMicState('error');
      setErrorMessage(transError || "Failed to transcribe.");
      setTimeout(() => setMicState('idle'), 3000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className={cn(
          "relative flex items-center justify-center rounded-full outline-none transition-colors",
          micState === 'idle' && "bg-coral text-cream hover:bg-coral/90",
          micState === 'recording' && "bg-gold text-cream",
          micState === 'uploading' && "bg-cream border-2 border-ocean/20 text-ocean",
          micState === 'transcribed' && "bg-gold text-cream",
          micState === 'error' && "bg-cream border-2 border-coral text-coral"
        )}
        animate={{
          width: micState === 'recording' ? 240 : 120,
          height: micState === 'recording' ? 80 : 120,
          scale: micState === 'idle' ? 1 : 1.05,
        }}
        whileHover={micState === 'idle' ? { scale: 1.05 } : {}}
        whileTap={micState === 'idle' ? { scale: 0.95 } : {}}
      >
        <AnimatePresence mode="wait">
          {micState === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Mic size={48} />
            </motion.div>
          )}

          {micState === 'recording' && (
            <motion.div 
              key="recording" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-4 border-gold opacity-50"
                style={{ scale: 1.1 }}
              />
              <span className="font-display font-medium text-lg ml-2">Listening</span>
              <Waveform analyser={analyser} />
            </motion.div>
          )}

          {micState === 'uploading' && (
            <motion.div 
              key="uploading" 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-2"
            >
              <Loader2 size={32} className="animate-spin text-ocean" />
            </motion.div>
          )}

          {micState === 'transcribed' && (
            <motion.div key="transcribed" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check size={48} />
            </motion.div>
          )}

          {micState === 'error' && (
            <motion.div key="error" initial={{ x: -10 }} animate={{ x: [0, -10, 10, -10, 10, 0] }} transition={{ duration: 0.4 }}>
              <AlertCircle size={48} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <div className="h-6">
        <AnimatePresence>
          {micState === 'idle' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ocean/50 font-medium text-sm">
              Hold to speak
            </motion.p>
          )}
          {micState === 'uploading' && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-ocean font-medium text-sm animate-pulse">
              Understanding...
            </motion.p>
          )}
          {micState === 'error' && errorMessage && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-coral font-medium text-sm">
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
