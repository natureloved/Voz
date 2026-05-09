# Voz — Tweet Thread

## Thread for hackathon submission / launch

---

**Tweet 1 (hook)**

Imagine sending money home and your mom hears your actual voice in her language.

Not a push notification.
Not a confirmation number.

Your words, translated, spoken.

That's Voz. 🧵

---

**Tweet 2 (the problem)**

Remittances are broken in two ways:

1. The sender needs a bank account, a wallet, or an app.
2. The recipient gets a number — not a feeling.

Voz solves both.

---

**Tweet 3 (how it works)**

You say: "Send 25 dollars to Maria for her birthday"

Claude parses the intent.
LI.FI bridges USDC from Base to Solana.
Maria gets a link.
She opens it → hears you, in Spanish.

That's the whole flow.

---

**Tweet 4 (the magic moment)**

The claim page is the product.

- Amount shown in USD and MXN
- Voice message auto-plays (ElevenLabs multilingual TTS)
- "Show transcript" reveals the translated text
- Solscan link shows the confirmed transaction

No wallet required on Maria's side. Ever.

---

**Tweet 5 (tech stack callout)**

Built with:

- @lifiprotocol — best bridge route, any EVM → Solana, one signature
- @ElevenLabs — STT for input, TTS for the voice message, in 2 languages
- @AnthropicAI Claude — intent parsing + natural translation (not literal)
- @solana — final destination, sub-cent fees

---

**Tweet 6 (AI agent angle)**

Claude isn't a chatbot here. It's a pipeline:

1. Parses "send 25 to Maria" → structured JSON
2. Extracts confidence level + ambiguities
3. Translates the message preserving warmth, not just words

System prompt: *"preserve warmth, occasion, natural phrasing — not literal"*

---

**Tweet 7 (demo)**

Try it yourself (no wallet needed):

→ [voz.app/demo](https://voz.app/demo)

Pre-fills "Send 25 dollars to Maria for her birthday"
Mocks the bridge
Creates a real claim page with real translated audio

The Spanish voice message is the moment.

---

**Tweet 8 (what's next)**

Next:
- Fiat off-ramp for the recipient (via Helio)
- WhatsApp delivery for the claim link
- More languages (Portuguese, French, Hindi)
- "Send rent to Carlos every month"

Remittances have a voice now.

---

**Tweet 9 (close)**

Built at Breakpoint 2025.

@solana @lifiprotocol @ElevenLabs @AnthropicAI

GitHub: [link]
Demo: voz.app/demo

Speak. Send. Heard.
