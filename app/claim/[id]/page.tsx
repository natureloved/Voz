import { notFound } from 'next/navigation';
import Anthropic from '@anthropic-ai/sdk';
import { getTransfer, updateTransfer } from '@/lib/transfers';
import { tts } from '@/lib/elevenlabs';
import { getUsdRate, SUPPORTED_CURRENCIES, SupportedCurrency } from '@/lib/fx';
import { kv, keys } from '@/lib/kv';
import { ClaimHero } from '@/components/claim/ClaimHero';

interface PageProps {
  params: { id: string };
}

async function ensureTranslationAndAudio(transferId: string) {
  const transfer = await getTransfer(transferId);
  if (!transfer) return null;

  // If already cached, return as-is
  if (transfer.translatedMessage) {
    const audioExists = (await kv.get(keys.audio(transferId))) as string | null;
    if (audioExists) return transfer;
  }

  // Translate with Claude
  let translatedMessage = transfer.senderMessageOriginal;
  const needsTranslation = transfer.senderLanguage !== transfer.recipientLanguage;

  if (needsTranslation) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        system: `You are a warm, natural translator. Translate the sender's message into ${
          transfer.recipientLanguage === 'es' ? 'Spanish' : 'English'
        }. Preserve warmth, emotion, and natural phrasing. If an occasion is mentioned (${
          transfer.occasion ?? 'none'
        }), maintain that tone. Do not be literal — be human. Return only the translated message, no explanation.`,
        messages: [{ role: 'user', content: transfer.senderMessageOriginal }],
      });
      const block = response.content[0];
      if (block.type === 'text') translatedMessage = block.text.trim();
    } catch {
      // Fall back to original message
    }
  }

  // Generate TTS audio
  try {
    const audioBuffer = await tts(translatedMessage, transfer.recipientLanguage);
    const audioB64 = Buffer.from(audioBuffer).toString('base64');
    await kv.set(keys.audio(transferId), audioB64);
  } catch {
    // No audio cached — client will still show transcript
  }

  // Cache translated message on transfer
  const updated = await updateTransfer(transferId, { translatedMessage });
  return updated ?? transfer;
}

export default async function ClaimPage({ params }: PageProps) {
  const transfer = await ensureTranslationAndAudio(params.id);
  if (!transfer) notFound();

  // Fetch FX rates for all supported currencies in parallel
  const rateEntries = await Promise.all(
    SUPPORTED_CURRENCIES.filter((c) => c !== 'USD').map(async (cur) => {
      const rate = await getUsdRate(cur as SupportedCurrency);
      return [cur, rate] as const;
    })
  );
  const rates = Object.fromEntries(rateEntries) as Partial<Record<SupportedCurrency, number>>;

  const audioUrl = `/api/audio/${params.id}`;

  return <ClaimHero transfer={transfer} rates={rates} audioUrl={audioUrl} />;
}

export const dynamic = 'force-dynamic';
