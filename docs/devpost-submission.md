# Voz — Devpost Submission

## Project name
Voz

## Tagline
Speak. Send. Heard. — Voice-first cross-chain payments to Solana.

## Demo link
https://voz.app/demo

## Repo
https://github.com/yourhandle/voz

---

## What it does

Voz is a voice-first remittance app that lets you say *"Send 25 dollars to Maria for her birthday"* and have Maria hear that message — translated into Spanish, spoken in a natural voice — the moment the USDC lands on Solana.

**The sender experience:**
1. Hold the mic, speak your intent in English or Spanish
2. Claude parses amount, recipient, message, and occasion
3. LI.FI finds the best bridge from your EVM chain to Solana
4. One transaction signature — USDC bridges, Maria gets a link

**The recipient experience:**
1. Open a link (no wallet, no app download)
2. See the amount in USD and their local currency (MXN, COP, NGN)
3. Hear the sender's voice message — translated to their language
4. Tap Solscan to verify the transaction

---

## How we built it

**Voice pipeline:** ElevenLabs Scribe v1 transcribes the sender's speech to text with language detection. After the bridge confirms, ElevenLabs TTS plays a translated version of the message on the claim page. Two different voices, two languages, same payment.

**AI Agent (Claude):** Claude Sonnet does two real-world jobs. First, it parses ambiguous natural speech into a typed `PaymentIntent` with structured fields (amount, recipient, message, occasion, confidence level) — using Zod validation with a retry loop. Second, it translates the sender's message for the recipient with a warmth-preserving system prompt rather than literal translation.

**Cross-chain (LI.FI):** The LI.FI SDK aggregates bridges from Base, Arbitrum, Optimism, and Polygon to Solana USDC. A quote API shows the best route, fees, and estimated time. A single wallet signature on the source chain executes the full bridge.

**Solana UX:** Recipients need no Solana wallet. The claim page is a public URL with no auth. An address book (backed by Vercel KV) stores contacts with names and Solana addresses, so you can say "Send to Maria" instead of pasting a public key. Multi-currency display converts the amount to local currency using CoinGecko rates. Transactional emails via Resend notify both sender and recipient.

---

## Challenges we ran into

- **Autoplay policy:** Mobile browsers block audio autoplay. The claim page degrades gracefully with a coral "Tap to hear your message" button when the policy fires.
- **LI.FI + Solana:** Getting the full EVM → Solana route to work end-to-end required careful setup of both the Wagmi EVM provider and the Solana wallet adapter in the same session.
- **Claude output reliability:** Natural language output for payment intent required a Zod retry loop — if the first response doesn't match the schema, it retries with the validation error as context.
- **KV cold-start:** The claim page generates and caches the translated audio on first load. For the demo this means the first visitor triggers the full pipeline — which is the magic moment.

---

## Accomplishments we're proud of

- The claim page experience — a non-crypto user opens a link and hears their family's voice in their language. That's the product.
- End-to-end voice pipeline: STT → NLP → bridge → TTS, all wired without manual steps.
- The address book integration: "Send to Maria" resolves to a Solana address through a fuzzy-match contact system, with a quick-add drawer when there's no match.

---

## What we learned

- ElevenLabs `eleven_multilingual_v2` produces remarkably natural Spanish output even for warm personal messages.
- Claude's system prompt matters enormously for translation quality — "preserve warmth and occasion" produces messages that feel like the sender wrote them in Spanish.
- LI.FI's route aggregation genuinely finds meaningfully different bridges depending on chain/amount — it's not just one bridge with a wrapper.

---

## What's next

- **Fiat off-ramp** — recipient redeems USDC → local bank via Helio or MoonPay
- **WhatsApp** — send claim link via WhatsApp Business API
- **More languages** — Portuguese, French, Hindi
- **Recurring** — "Send rent to Carlos every month" (scheduled via Claude)
- **Mobile** — React Native with the same voice → payment core

---

## Track eligibility

| Track | Evidence |
|-------|---------|
| Best App on Solana | Full UX, address book, claim page, email, multi-currency |
| Best Cross-chain with LI.FI | lib/lifi.ts, /api/quote, route execution with live timeline |
| Best ElevenLabs Integration | STT + TTS in 2 languages, voice translation pipeline |
| Best AI Agent (Claude) | Intent parsing with Zod + warmth-preserving translation |

---

## Built with

Next.js · Wagmi · Solana Wallet Adapter · LI.FI SDK · Anthropic Claude Sonnet · ElevenLabs · Vercel KV · Resend · React Email · Framer Motion · Tailwind CSS
