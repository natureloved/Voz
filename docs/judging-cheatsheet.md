# Voz — Judging Cheatsheet

One page. Four tracks. Exact file locations.

---

## Best App on Solana

**What to look for:**
- Address book backed by KV: `lib/contacts.ts` → `getContacts`, `createContact`, `fuzzyMatch`
- Contacts page: `app/contacts/page.tsx`
- "Send to Maria" name resolution: `components/send/IntentReview.tsx` lines 37–58
- Claim page (no wallet): `app/claim/[id]/page.tsx`
- Multi-currency toggle (USD/MXN/COP/NGN): `components/claim/LocalCurrencyToggle.tsx`
- CoinGecko FX rates: `lib/fx.ts`
- Email to recipient + sender: `app/api/emails/send-claim/route.ts`
- React Email templates: `emails/RecipientNotification.tsx`, `emails/SenderConfirmation.tsx`

**The demo moment:** Click "Open Maria's claim page" in `/demo` and toggle to MXN.

---

## Best Cross-chain App on Solana with LI.FI

**What to look for:**
- LI.FI SDK init: `lib/lifi.ts`
- Quote API: `app/api/quote/route.ts` — calls `getRoutes()` with fromChain, toChain (Solana), USDC addresses
- Route execution: `lib/route-execution.ts` — `executeLifiRoute` wraps `executeRoute` with live callbacks
- Live timeline: `components/send/StepExecute.tsx` — maps LiFi process types (`TOKEN_ALLOWANCE`, `CROSS_CHAIN`, `RECEIVING_CHAIN`) to timeline states
- Supported chains: Base (8453), Arbitrum (42161), Optimism (10), Polygon (137) → Solana (1151111081099710)

**The demo moment:** `app/demo/page.tsx` shows the mock Stargate route card and the animated timeline.

---

## Best ElevenLabs Integration

**What to look for:**
- STT: `app/api/transcribe/route.ts` — posts audio to `https://api.elevenlabs.io/v1/speech-to-text` with model `scribe_v1`
- TTS: `lib/elevenlabs.ts` — calls `/v1/text-to-speech/{voiceId}` with `eleven_multilingual_v2` (ES) or `eleven_turbo_v2_5` (EN)
- Confirmation TTS: `components/send/StepDone.tsx` — plays TTS after successful send
- Translation + TTS pipeline: `app/claim/[id]/page.tsx` — on first claim load, calls ElevenLabs TTS after Claude translation, caches audio in KV at `voz:audio:{id}`
- Audio serving: `app/api/audio/[id]/route.ts` — streams cached MP3 from KV
- Voice player: `components/claim/VoiceMessage.tsx` — autoplay with waveform, blocked fallback, transcript toggle

**The demo moment:** Open `/claim/{id}` and hear the Spanish voice message play automatically.

---

## Best AI Agent in Real Environments (Claude)

**What to look for:**
- Intent parsing agent: `app/api/parse-intent/route.ts`
  - System prompt guides Claude to extract structured fields
  - Zod schema validation with retry on failure: `lib/intent-schema.ts`
  - Returns `{ amount, recipient: { kind, value }, message, language, occasion, confidence, ambiguities }`
- Translation agent: `app/claim/[id]/page.tsx` lines 20–42
  - System prompt: *"preserve warmth, occasion, natural phrasing — not literal"*
  - Model: `claude-3-5-sonnet-20241022`
  - Only runs once per transfer; result cached in KV

**The demo moment:** In `/demo`, the review step shows Claude's parsed output. In `/claim/{id}`, the translated Spanish transcript is Claude's work (click "Show transcript").

---

## Quick navigation

```
/           Landing page
/demo       Wallet-free demo (start here for judges)
/send       Full send flow (requires EVM + Solana wallet)
/contacts   Address book
/claim/:id  Recipient claim page (shareable, no auth)
```

## Key files at a glance

```
app/
  api/
    parse-intent/    ← Claude STT
    transcribe/      ← ElevenLabs STT
    tts/             ← ElevenLabs TTS
    quote/           ← LI.FI route
    transfers/       ← KV CRUD
    audio/[id]/      ← Cached audio serving
    emails/          ← Resend
    og/              ← OG image
  send/              ← 5-step flow
  demo/              ← Wallet-free demo
  claim/[id]/        ← Recipient page
  contacts/          ← Address book

lib/
  lifi.ts            ← LI.FI SDK
  elevenlabs.ts      ← TTS function
  claude.ts          ← Anthropic client
  contacts.ts        ← KV CRUD + fuzzy match
  transfers.ts       ← KV CRUD
  fx.ts              ← CoinGecko rates
  demo-mode.ts       ← Mock data
```
