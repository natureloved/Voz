import { MicButton } from '@/components/voice/MicButton';
import { TranscriptCard } from '@/components/voice/TranscriptCard';
import { TranscribeResponse } from '@/hooks/useTranscribe';

interface StepVoiceProps {
  transcript: TranscribeResponse | null;
  onTranscribe: (data: TranscribeResponse) => void;
}

export function StepVoice({ transcript, onTranscribe }: StepVoiceProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 sm:space-y-12 py-8 sm:py-12">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Who to pay?</h2>
        <p className="text-ocean/60 font-sans max-w-sm">
          Hold the microphone and say something like "Send 20 dollars to Maria".
        </p>
      </div>

      <MicButton onTranscribe={onTranscribe} />

      {transcript && (
        <div className="w-full max-w-md">
          <TranscriptCard transcript={transcript} />
        </div>
      )}
    </div>
  );
}
