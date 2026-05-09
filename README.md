# Voz — Speak. Send. Heard.

> Voice-first cross-chain remittance. Any EVM chain → Solana, in your language.

**[Try the demo →](https://voz.app/demo)** · No wallet required

---

## One-line pitch

Voz lets you say *"Send 25 dollars to Maria for her birthday"* and have Maria hear that message — translated, in her voice, in Spanish — the moment the USDC lands on Solana.

---

## The four tracks

### 1 · Best Cross-chain App on Solana with LI.FI

| What | Where |
|------|-------|
| SDK init + route aggregation | [`lib/lifi.ts`](lib/lifi.ts) |
| Quote API (best route, fees, gas) | [`app/api/quote/route.ts`](app/api/quote/route.ts) |
| Cross-chain execution | [`lib/route-execution.ts`](lib/route-execution.ts) |
| Live timeline (approve → bridge → confirm) | [`components/send/StepExecute.tsx`](components/send/StepExecute.tsx) |

LI.FI aggregates bridges from **Base, Arbitrum, Optimism, and Polygon** to **Solana USDC** in a single user signature. The quote step shows the best route, fees, gas, and estimated time. One click executes.

---

### 2 · Best ElevenLabs Integration

| What | Where |
|------|-------|
| STT — voice → text (Scribe v1) | [`app/api/transcribe/route.ts`](app/api/transcribe/route.ts) |
| TTS — confirmation audio | [`app/api/tts/route.ts`](app/api/tts/route.ts), [`lib/elevenlabs.ts`](lib/elevenlabs.ts) |
| Voice translation pipeline | [`app/claim/[id]/page.tsx`](app/claim/%5Bid%5D/page.tsx) |
| Bilingual voice player | [`components/claim/VoiceMessage.tsx`](components/claim/VoiceMessage.tsx) |

ElevenLabs is used **twice per payment** — once to transcribe the sender's voice, once to speak the translated message to the recipient. The claim page auto-plays on load using `eleven_multilingual_v2` for Spanish and `eleven_turbo_v2_5` for English. STT + TTS in two languages, not one.

---

### 3 · Best AI Agent in Real Environments (Claude)

| What | Where |
|------|-------|
| Structured intent parsing | [`app/api/parse-intent/route.ts`](app/api/parse-intent/route.ts) |
| Zod-validated output schema | [`lib/intent-schema.ts`](lib/intent-schema.ts) |
| Natural translation (warmth-preserving) | [`app/claim/[id]/page.tsx`](app/claim/%5Bid%5D/page.tsx) L20–42 |

Claude does **two real jobs**: (1) parse ambiguous speech into a structured `PaymentIntent` with amount, recipient, occasion, and confidence — retrying if the Zod schema fails; (2) translate the sender's message for the recipient, with a system prompt that preserves warmth rather than literal meaning. This is an agent taking real-world actions, not a chatbot.

---

### 4 · Best App on Solana (UX completeness)

| Feature | Where |
|---------|-------|
| Address book (KV-backed, per EVM wallet) | [`app/contacts`](app/contacts/page.tsx), [`lib/contacts.ts`](lib/contacts.ts) |
| Name resolution in send flow | [`components/send/IntentReview.tsx`](components/send/IntentReview.tsx) |
| Shareable claim page (no auth) | [`app/claim/[id]/page.tsx`](app/claim/%5Bid%5D/page.tsx) |
| Multi-currency display (USD/MXN/COP/NGN) | [`lib/fx.ts`](lib/fx.ts), [`components/claim/LocalCurrencyToggle.tsx`](components/claim/LocalCurrencyToggle.tsx) |
| Transactional email (Resend) | [`app/api/emails/send-claim`](app/api/emails/send-claim/route.ts) |
| Bilingual UI + emails | `'en' \| 'es'` throughout |

---

## Architecture

```
User speaks
     │
     ▼
ElevenLabs Scribe (/api/transcribe)
     │  text + language
     ▼
Claude Sonnet (/api/parse-intent)
     │  { amount, recipient, message, occasion, confidence }
     ▼
[IntentReview] ──name?──► KV address book lookup
     │  resolved Solana address
     ▼
LI.FI SDK (/api/quote)
     │  best route: Base/Arb/Op/Polygon → Solana
     ▼
executeLifiRoute (wagmi sign + bridge)
     │  txHash
     ▼
Transfer record → KV  (/api/transfers POST)
     │
     ├─► Resend email → recipient + sender
     │
     └─► /claim/[id]  (server component)
              │
              ├─ Claude translates EN → ES
              ├─ ElevenLabs TTS → cached in KV
              └─ ClaimHero: amount + voice player + Solscan link
```

---

## Local setup

```bash
git clone https://github.com/yourhandle/voz
cd voz
npm install
cp .env.example .env.local
# fill in env vars (see below)
npm run dev
```

### Environment variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=   # cloud.walletconnect.com
NEXT_PUBLIC_LIFI_INTEGRATOR=voz-dev3pack

ANTHROPIC_API_KEY=                      # console.anthropic.com
ELEVENLABS_API_KEY=                     # elevenlabs.io
ELEVENLABS_VOICE_ID_EN=                 # English voice ID
ELEVENLABS_VOICE_ID_ES=                 # Spanish voice ID (use multilingual model)

RESEND_API_KEY=                         # resend.com

KV_REST_API_URL=                        # Upstash Redis REST URL
KV_REST_API_TOKEN=                      # Upstash Redis REST token

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Try the demo (no wallet needed)

```bash
npm run dev
# open http://localhost:3000/demo
```

The demo pre-fills the flow, mocks LiFi + execution, creates a real transfer record, and lands on a live claim page where Claude translates the message and ElevenLabs speaks it in Spanish.

---

## What's next

- **Fiat off-ramp** — recipient redeems USDC → local bank via Helio or MoonPay
- **More languages** — Portuguese, French, Hindi (ElevenLabs multilingual covers all)
- **WhatsApp delivery** — send the claim link via WhatsApp Business API
- **Recurring payments** — "Send rent to Carlos every month"
- **Mobile app** — React Native with the same voice → payment core

---

## Tech stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router |
| EVM wallets | Wagmi + RainbowKit |
| Solana wallets | Wallet Adapter (Phantom, Solflare) |
| Cross-chain | LI.FI SDK |
| AI parsing + translation | Claude Sonnet (Anthropic) |
| Voice I/O | ElevenLabs Scribe v1 + TTS |
| Storage | Vercel KV (Upstash Redis) |
| Email | Resend + React Email |
| Animations | Framer Motion |
| Styling | Tailwind CSS |
