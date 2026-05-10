# Voz; Speak. Send. Heard.

## What is Voz?

Voz is a voice-first cross-border remittance app. A sender on any EVM chain - Base, Arbitrum, Optimism, or Polygon — speaks a payment in English or Spanish, like *"Send fifty dollars to my sister Ana for groceries."* Within sixty seconds, USDC lands in Ana's Solana wallet, and Ana receives a claim link where she hears the message voiced naturally in Spanish: *"Ana, tu hermano te envió cincuenta dólares para el mercado."*

Voice in. Voice out. Money moves on Solana. No addresses, no chains, no English required.

---

## The Problem

Cross-border remittance is an **$830B/year market**. The US-to-Latin America corridor alone moves over $75B annually — Mexico received $63B in 2023, Colombia $11B. Tens of millions of people depend on this corridor every month.

The experience is broken in a specific way that crypto has not yet fixed:

**The senders** are workers who left home to earn elsewhere. They're often more fluent in spoken language than written. **The recipients** are family frequently parents and grandparents with high spoken fluency in their native language but low literacy with banking interfaces, especially when those interfaces present hex addresses, network selectors, and transaction confirmations in a second language.

**Traditional services** (Western Union, MoneyGram) charge 5–7% in fees and require physical pickup, costing hours and dollars. **Crypto remittance attempts** assume both parties can read English, parse Solana addresses, manage seed phrases, and operate wallet UI — none of which matches the actual user.

The deeper problem: **money apps assume reading. The corridor that needs them most lives in voice.**

---

## How Voz Works

Voz collapses the entire remittance flow into a sentence the sender already knows how to say.

### You Send

1. **Connect** your wallet — Base, Arbitrum, Optimism, or Polygon
2. **Speak** what you want to send: *"Send fifty dollars to Maria for her birthday"*
3. **Confirm** the amount and recipient
4. **Approve** the transaction — Voz bridges to Solana automatically
5. **Send** the claim link by email, or copy it to share anywhere

### They Receive

1. **Open** the claim link on any phone
2. **Hear** your message in their language
3. **Receive** USDC straight into their Solana wallet

*No app to download. No wallet to connect.*

---

## Architecture

Voz is built on four integrated systems, each handling a distinct part of the journey from spoken intent to received funds.

### 1. Voice In — ElevenLabs Scribe (Speech-to-Text)

When the sender holds the microphone, audio is captured client-side and sent to ElevenLabs' Scribe v1 model via a Next.js API route (`/api/transcribe`). Scribe returns a transcript and a detected language code (English or Spanish), which routes the rest of the flow. Recordings under one second are rejected with a friendly inline message. If the detected language is not EN or ES, it defaults to English with a warning.

### 2. Intent Parsing — Claude as an AI Agent

The transcript is passed to Claude (Sonnet) with a structured-output system prompt and Zod schema validation (`/api/parse-intent`). Claude extracts a typed `PaymentIntent` from natural speech in either language:

```typescript
{
  amount: number,                    // USD — word-form numbers converted automatically
  recipient: { kind: 'name' | 'address', value: string },
  message?: string,                  // optional sender note
  language: 'en' | 'es',            // detected sender language
  occasion?: string,                 // birthday, rent, groceries — used for tone
  confidence: 'high' | 'medium' | 'low',
  ambiguities: string[]             // surfaced to sender for confirmation
}
```

This includes converting word-form numbers ("fifty," "cincuenta") to numeric values, identifying recipients by name from the user's address book, and recognizing context like "for her birthday" as occasion metadata. When confidence is low, the agent surfaces ambiguities for the sender to confirm rather than executing blindly — a deliberate pattern for agentic financial tools. The agent never guesses with real money.

### 3. Cross-Chain Settlement — LI.FI SDK

The confirmed intent is passed to the LI.FI SDK (v3.4.1), which discovers and executes a route from the sender's EVM USDC to USDC on Solana (`/api/quote` + `lib/route-execution.ts`). LI.FI handles bridge selection (Across, Stargate, Mayan, deBridge — whichever has best liquidity at the moment), ERC-20 approval, the bridge transaction, and Solana-side confirmation monitoring.

The bridge name and live status are surfaced in a vertical timeline UI:

```
Approving USDC on Base        ✓
Bridging via Across            ✓
Confirming on Solana           ✓
Done                           ✓
```

Each step shows the real transaction hash, clickable to Basescan or Solscan. The SDK was chosen over the LI.FI Widget because Voz's voice-first UX requires LI.FI to be **invisible** — the sender never sees a bridge picker or chain selector.

### 4. Voice Out — Claude Translation + ElevenLabs TTS

When the recipient opens their claim link (`/claim/[id]`), two things happen:

1. **Claude translates** the sender's original message into the recipient's language with a system prompt that preserves emotional tone, occasion, and natural phrasing — not literal translation. *"Send fifty dollars to Ana for groceries"* becomes *"Ana, tu hermano te envió cincuenta dólares para el mercado"* — warm, natural, contextual.

2. **ElevenLabs TTS** voices the translated message using a per-language voice ID. The audio is cached in Vercel KV so replays are instant.

The sender also gets a voice confirmation in *their* language at the end of the send flow.


---

## Tech Stack

### Frontend
- **Next.js 14** (App Router) — full-stack React framework
- **TypeScript** — strict typing across the entire codebase
- **Tailwind CSS** — utility-first styling with custom brand tokens
- **Framer Motion** — page transitions, mic animations, count-ups

### Wallet & Web3
- **wagmi** + **viem** — EVM wallet connection and transaction primitives
- **RainbowKit** — EVM wallet selector UI
- **@solana/wallet-adapter-react** + **@solana/web3.js** — Solana wallet integration

### Cross-Chain
- **@lifi/sdk** v3.4.1 — route discovery and execution from EVM to Solana

### AI & Voice
- **@anthropic-ai/sdk** — Claude (Sonnet) for intent parsing and natural translation
- **ElevenLabs Scribe v1** — speech-to-text with language detection
- **ElevenLabs Multilingual TTS** — text-to-speech with per-language voice IDs

### Data & Validation
- **Zod** — runtime schema validation for PaymentIntent and contacts
- **Vercel KV** — transfer records, contacts, audio cache

### Email
- **Resend** + **@react-email/components** — branded transactional emails

### Deployment
- **Vercel** — hosting, serverless functions, edge cache, KV
- **pnpm** — package manager

### Settlement
- **Solana mainnet** — all transfers settle as native USDC on Solana

---

## Design System

Voz uses a warm, anti-DeFi palette designed to feel approachable to non-crypto users.

| Token | Value | Usage |
|-------|-------|-------|
| Ocean | `#0A2540` | Primary text, backgrounds, trust |
| Coral | `#FF6B5C` | CTAs, accents, brand energy |
| Gold | `#F5C842` | Success states, confirmations, orbit dots |
| Cream | `#FBF7EF` | Page backgrounds, cards |

**Typography:** Inter Tight (display/headlines), Inter (body), JetBrains Mono (numbers/addresses/tx hashes)

---

## Project Structure

```
app/
├── page.tsx                          # Landing page — "Speak. Send. Heard."
├── send/page.tsx                     # Multi-step send flow
├── demo/page.tsx                     # Pre-populated demo flow (no real funds)
├── claim/[id]/page.tsx               # Recipient claim page with voice playback
├── contacts/page.tsx                 # Address book
├── lab/route-test/page.tsx           # LI.FI de-risk verification page
├── api/
│   ├── transcribe/route.ts           # ElevenLabs Scribe (STT)
│   ├── parse-intent/route.ts         # Claude intent parsing
│   ├── quote/route.ts                # LI.FI route discovery
│   ├── tts/route.ts                  # ElevenLabs TTS
│   ├── transfers/route.ts            # KV transfer record CRUD
│   ├── transfers/[id]/route.ts       # Single transfer lookup
│   ├── contacts/route.ts             # KV contacts CRUD
│   ├── audio/[id]/route.ts           # Cached audio streaming
│   └── emails/send-claim/route.ts    # Resend email delivery
components/
├── voice/                            # MicButton, Waveform, TranscriptCard
├── send/                             # StepVoice, StepReview, StepQuote, StepExecute, StepDone
├── claim/                            # ClaimHero, VoiceMessage, LocalCurrencyToggle
├── contacts/                         # ContactList, ContactForm, ContactPicker
├── wallet/                           # WalletBar, EvmConnectButton, SolanaConnectButton
└── ui/                               # Button, Card, Input (brand primitives)
lib/
├── lifi.ts                           # LI.FI SDK configuration with EVM + Solana providers
├── route-execution.ts                # executeRoute wrapper with status callbacks
├── claude.ts                         # Anthropic SDK client
├── elevenlabs.ts                     # ElevenLabs scribe() + tts() helpers
├── intent-schema.ts                  # PaymentIntent Zod schema
├── wagmi.ts                          # wagmi config (Base, Arbitrum, Optimism, Polygon)
├── solana.ts                         # Solana connection + USDC SPL mint
├── chains.ts                         # Chain constants
├── tokens.ts                         # USDC addresses per chain
├── transfers.ts                      # KV CRUD for transfers
├── contacts.ts                       # KV CRUD for contacts
├── kv.ts                             # Vercel KV client + key helpers
├── fx.ts                             # CoinGecko FX cache
└── cn.ts                             # clsx + tailwind-merge
```

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm
- Accounts/API keys: Anthropic, ElevenLabs, Vercel (for KV), Resend, WalletConnect

### Setup

```bash
git clone https://github.com/yourusername/voz.git
cd voz
pnpm install
cp .env.example .env.local
```

### Environment Variables

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
NEXT_PUBLIC_LIFI_INTEGRATOR=voz-dev3pack
ANTHROPIC_API_KEY=sk-ant-...
ELEVENLABS_API_KEY=your_elevenlabs_key
ELEVENLABS_VOICE_ID_EN=your_english_voice_id
ELEVENLABS_VOICE_ID_ES=your_spanish_voice_id
RESEND_API_KEY=re_...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run

```bash
pnpm dev
```

Open (http://localhost:3000).

---

## Mainnet

Voz runs on mainnet (https://voz-three.vercel.app/) from day one. Real Base, real Solana, real USDC. Every transaction in the demo is a real on-chain transfer with a verifiable hash on Solscan. Built this way because the cross-chain remittance thesis only works if it actually works — testnet remittance isn't remittance.

---

## Key Learnings

**DeFi UX insight:** Users conflate goal creation with funding — the deposit action must be unmissably integrated into the creation flow, not treated as a separate step. In Voz, the "speak → confirm → send" flow is deliberately linear with no branches.

**LI.FI API quirk:** The integrator string must be alphanumeric (plus `-`, `_`, `.`) and under 23 characters. UUIDs will be rejected with a 400 ValidationError. Use a short, descriptive string like `voz-dev3pack`.

**Voice-first design principle:** When voice is the input, the confirmation step becomes more important, not less. Real money deserves real verification. The AI agent should ask when ambiguous, not guess — this is a feature, not a limitation.

**Cross-chain settlement:** LI.FI's SDK handles bridge selection automatically based on current liquidity. Different bridges (Across, Stargate, Mayan, deBridge) activate at different times. Don't hardcode a bridge — let the aggregator do its job.

---

## What's Next

**Expanded language support.** French for France→Maghreb and Canada→Haiti corridors. Portuguese for US→Brazil. Tagalog for US→Philippines. Each language pair unlocks a multi-billion-dollar remittance corridor.

**Any source token via swap-and-bridge.** Accept ETH, USDT, and native chain tokens — let LI.FI route through a swap before bridging to USDC on Solana. The sender holds whatever they hold; the recipient always gets USDC.

**Single-wallet flow via Phantom EVM.** Sender connects one Phantom wallet that holds both EVM USDC and a Solana receive address, eliminating the dual-wallet UX.

**Fiat off-ramp on the recipient side.** Partner with a Solana-native off-ramp provider so the recipient can withdraw to their local bank account or mobile money directly from the claim page.

**Solana-native messaging.** Store the voice message as an on-chain memo or via Shadow Drive, making the claim page verifiable and permanent.

**Multiple LI.FI routes displayed.** Surface multiple routes side-by-side in the Quote step so power users can choose between fastest vs. cheapest bridging.

**Notification system.** Push notifications and SMS delivery of claim links for recipients without email.

---

## Why This Matters

Voz is not an incremental UX improvement on existing crypto remittance. It rethinks the assumption that a financial interface must be read. The corridors that need cross-border payments most are corridors where voice is more accessible than text, where Spanish is more fluent than English, and where the recipient's grandmother was never going to learn what a Solana address is.

The technology stack — ElevenLabs voice, Claude as an agent, LI.FI cross-chain, Solana settlement — exists today in a way it didn't even twelve months ago. Voz is the product that becomes possible when those four primitives line up.

---

## Built For

**Dev3pack Global Hackathon** · May 8–10, 2026 · Built solo in 48 hours.


---


