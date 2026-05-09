'use client';

import * as React from 'react';
import { Play, Pause, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceMessageProps {
  audioUrl: string;
  translatedMessage: string;
  senderName?: string;
}

export function VoiceMessage({ audioUrl, translatedMessage, senderName }: VoiceMessageProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [showTranscript, setShowTranscript] = React.useState(false);
  const [blocked, setBlocked] = React.useState(false);
  const [wavePhase, setWavePhase] = React.useState(0);
  const animFrameRef = React.useRef<number>(0);

  // Animate waveform while playing
  React.useEffect(() => {
    if (playing) {
      const tick = () => {
        setWavePhase((p) => p + 0.1);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      animFrameRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(animFrameRef.current);
    }
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playing]);

  // Auto-play on mount
  React.useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onended = () => { setPlaying(false); setProgress(0); };
    audio.ontimeupdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };

    audio.play().catch(() => setBlocked(true));
    setPlaying(true);

    return () => { audio.pause(); audio.src = ''; };
  }, [audioUrl]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setBlocked(true));
      setPlaying(true);
      setBlocked(false);
    }
  }

  const bars = Array.from({ length: 24 });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {/* Play / pause button */}
        <button
          onClick={togglePlay}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ocean flex items-center justify-center shrink-0 hover:bg-ocean/90 transition-colors shadow-lg"
        >
          {playing ? <Pause size={24} className="text-cream" /> : <Play size={24} className="text-cream ml-1" />}
        </button>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-0.5 h-12">
          {bars.map((_, i) => {
            const barProgress = i / bars.length;
            const isPlayed = barProgress < progress;
            const height = playing
              ? 20 + 24 * Math.abs(Math.sin(wavePhase + i * 0.4))
              : 8 + 20 * Math.abs(Math.sin(i * 0.5));
            return (
              <motion.div
                key={i}
                animate={{ height: `${height}px` }}
                transition={{ duration: 0.05 }}
                className={`flex-1 rounded-full ${isPlayed ? 'bg-ocean' : 'bg-ocean/20'}`}
              />
            );
          })}
        </div>
      </div>

      {/* Autoplay blocked fallback */}
      <AnimatePresence>
        {blocked && (
          <motion.button
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={togglePlay}
            className="w-full py-3 rounded-xl bg-coral text-cream font-semibold text-sm"
          >
            Tap to hear your message
          </motion.button>
        )}
      </AnimatePresence>

      {/* Transcript toggle */}
      <button
        onClick={() => setShowTranscript((s) => !s)}
        className="flex items-center gap-1.5 text-xs text-ocean/50 hover:text-ocean transition-colors"
      >
        {showTranscript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        {showTranscript ? 'Hide transcript' : 'Show transcript'}
      </button>

      <AnimatePresence>
        {showTranscript && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="font-display text-lg text-ocean/70 italic leading-relaxed border-l-2 border-gold pl-4">
              &ldquo;{translatedMessage}&rdquo;
            </p>
            {senderName && (
              <p className="text-xs text-ocean/40 mt-2 pl-4">— {senderName}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
