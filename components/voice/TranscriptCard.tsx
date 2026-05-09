import { Card, CardContent } from "@/components/ui/Card";
import { TranscribeResponse } from "@/hooks/useTranscribe";

export function TranscriptCard({ transcript }: { transcript: TranscribeResponse | null }) {
  if (!transcript) return null;

  return (
    <Card className="mt-6 border-ocean/10 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-6 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-medium bg-ocean/5 text-ocean px-2 py-1 rounded">
            Detected: {transcript.language === 'en' ? 'English' : transcript.language === 'es' ? 'Spanish' : transcript.language}
          </span>
          {transcript.language_warning && (
            <span className="text-xs font-mono font-medium bg-coral/10 text-coral px-2 py-1 rounded">
              Defaulted to EN
            </span>
          )}
        </div>
        <p className="text-lg font-medium text-ocean tracking-tight">
          "{transcript.text}"
        </p>
      </CardContent>
    </Card>
  );
}
