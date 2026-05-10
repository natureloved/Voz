import { NextResponse } from 'next/server';
import { PaymentIntentSchema } from '@/lib/intent-schema';
import Anthropic from '@anthropic-ai/sdk';

const SYSTEM_PROMPT = `You are Voz's payment intent parser. Extract payment details from voice transcripts.

RESPOND WITH ONLY A JSON OBJECT. No markdown, no code fences, no explanation. Just the raw JSON.

Schema:
{
  "amount": number,
  "recipient": { "kind": "name" | "address", "value": string },
  "message": string or null,
  "language": "en" | "es",
  "occasion": string or null,
  "confidence": "high" | "medium" | "low",
  "ambiguities": []
}

RULES:
1. ALWAYS convert number words to digits: "two"=2, "ten"=10, "twenty"=20, "fifty"=50, "hundred"=100, "twenty-five"=25
2. Spanish numbers: "dos"=2, "diez"=10, "veinte"=20, "cincuenta"=50, "cien"=100
3. NEVER return amount:0 unless the user said "zero"
4. If amount is unclear, guess a reasonable number and set confidence:"low"
5. "bucks" = "dollars", "a few bucks" = 5
6. Extract recipient name or address from the transcript
7. Detect occasions: birthday, rent, groceries, dinner, etc.

Examples:

Input: "Send 20 dollars to Maria"
{"amount":20,"recipient":{"kind":"name","value":"Maria"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send two dollars to James"
{"amount":2,"recipient":{"kind":"name","value":"James"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send ten dollars to James"
{"amount":10,"recipient":{"kind":"name","value":"James"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send 25 dollars to Maria for her birthday"
{"amount":25,"recipient":{"kind":"name","value":"Maria"},"occasion":"birthday","language":"en","confidence":"high","ambiguities":[]}

Input: "Send fifty dollars to Ana for groceries"
{"amount":50,"recipient":{"kind":"name","value":"Ana"},"occasion":"groceries","language":"en","confidence":"high","ambiguities":[]}

Input: "Envía diez dólares a María"
{"amount":10,"recipient":{"kind":"name","value":"María"},"language":"es","confidence":"high","ambiguities":[]}

Input: "Mándale cincuenta a Carlos para la renta"
{"amount":50,"recipient":{"kind":"name","value":"Carlos"},"occasion":"rent","language":"es","confidence":"high","ambiguities":[]}

Input: "Send money to John"
{"amount":0,"recipient":{"kind":"name","value":"John"},"language":"en","confidence":"low","ambiguities":["amount unclear"]}

RESPOND WITH ONLY THE JSON OBJECT.`;

// ─── Regex fast-path ────────────────────────────────────────────────────────

const WORD_NUMS: Record<string, number> = {
  zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9, ten:10,
  eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15, sixteen:16, seventeen:17,
  eighteen:18, nineteen:19, twenty:20, thirty:30, forty:40, fifty:50, sixty:60,
  seventy:70, eighty:80, ninety:90, hundred:100,
  // Spanish
  cero:0, uno:1, dos:2, tres:3, cuatro:4, cinco:5, seis:6, siete:7, ocho:8, nueve:9, diez:10,
  once:11, doce:12, trece:13, catorce:14, quince:15, veinte:20, treinta:30, cuarenta:40,
  cincuenta:50, sesenta:60, setenta:70, ochenta:80, noventa:90, cien:100,
};

function parseWordAmount(str: string): number | null {
  const parts = str.toLowerCase().replace(/-/g, ' ').trim().split(/\s+/);
  if (parts.length === 1) return WORD_NUMS[parts[0]] ?? null;
  if (parts.length === 2) {
    const a = WORD_NUMS[parts[0]];
    const b = WORD_NUMS[parts[1]];
    if (a != null && b != null) {
      if (b === 100) return a * 100;          // "two hundred" = 200
      if (a >= 20 && b < 10) return a + b;   // "twenty five" = 25
    }
  }
  return null;
}

function regexParse(transcript: string, language: string): Record<string, unknown> | null {
  const t = transcript.trim();

  let amountStr = '';
  let recipientStr = '';

  // English: "send ... to NAME"
  const enMatch = t.match(/\bsend\s+(.*?)\s+to\s+([A-Za-zÀ-ÿ]+)(?:\s|$)/i);
  if (enMatch) {
    amountStr = enMatch[1];
    recipientStr = enMatch[2];
  }

  // Spanish: "envía/envíale/mándale/mandame ... a NAME"
  if (!amountStr) {
    const esMatch = t.match(/\b(?:envi[aá](?:le|me)?|mand[aá](?:le|me)?)\s+(.*?)\s+a\s+([A-Za-zÀ-ÿ]+)(?:\s|$)/i);
    if (esMatch) {
      amountStr = esMatch[1];
      recipientStr = esMatch[2];
    }
  }

  if (!amountStr || !recipientStr) return null;

  // Strip currency words from amount string
  const cleanAmt = amountStr.replace(/\$|dollars?|bucks?|d[oó]lares?/gi, '').trim();

  // Parse amount: digits first, then number words
  let amount: number | null = null;
  const directNum = parseFloat(cleanAmt.replace(/,/g, ''));
  if (!isNaN(directNum) && directNum > 0) {
    amount = directNum;
  } else {
    amount = parseWordAmount(cleanAmt);
  }

  if (!amount || amount <= 0) return null;

  // Reject if recipient looks like a currency word (regex matched wrong token)
  if (/^(?:dollars?|bucks?|d[oó]lares?)$/i.test(recipientStr)) return null;

  const recipient = recipientStr.charAt(0).toUpperCase() + recipientStr.slice(1).toLowerCase();

  // Detect common occasions
  let occasion: string | undefined;
  if (/birthday|cumplea/i.test(t)) occasion = 'birthday';
  else if (/\brent\b|renta\b/i.test(t)) occasion = 'rent';
  else if (/grocer|mercado/i.test(t)) occasion = 'groceries';
  else if (/\bdinner\b|cena\b/i.test(t)) occasion = 'dinner';
  else if (/\blunch\b|almuerzo\b/i.test(t)) occasion = 'lunch';

  const result: Record<string, unknown> = {
    amount,
    recipient: { kind: 'name', value: recipient },
    language: language || 'en',
    confidence: 'high',
    ambiguities: [],
  };
  if (occasion) result.occasion = occasion;
  return result;
}

// ─── JSON extraction ─────────────────────────────────────────────────────────

function extractJson(text: string): Record<string, unknown> | null {
  if (!text || text.trim().length === 0) {
    console.error('[parse-intent] Empty response from Claude');
    return null;
  }

  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        console.error('[parse-intent] Found JSON-like block but failed to parse:', match[0].substring(0, 200));
        return null;
      }
    }
    console.error('[parse-intent] No JSON object found in response:', cleaned.substring(0, 200));
    return null;
  }
}

// ─── Claude call (lazy client init so missing key doesn't break module load) ──

async function callClaude(transcript: string, language: string, retryContext?: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('[parse-intent] ANTHROPIC_API_KEY is not set — skipping Claude');
    return null;
  }

  const client = new Anthropic({ apiKey });

  let userMessage = `Input: "${transcript}"\nLanguage: "${language}"`;
  if (retryContext) {
    userMessage += `\n\nYour previous response was invalid: ${retryContext}\nPlease respond with ONLY a valid JSON object matching the schema.`;
  }

  console.log('[parse-intent] Calling Claude with:', userMessage.substring(0, 100));

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    console.log('[parse-intent] Claude stop_reason:', message.stop_reason);

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    console.log('[parse-intent] Claude raw text:', responseText.substring(0, 300));

    if (!responseText) {
      console.error('[parse-intent] Claude returned empty text content');
      return null;
    }

    return extractJson(responseText);
  } catch (err: any) {
    console.error('[parse-intent] Claude API call failed:', err.message);
    if (err.status) console.error('[parse-intent] HTTP status:', err.status);
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, language } = body;

    console.log('[parse-intent] Received:', { transcript: transcript?.substring(0, 80), language });

    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const lang = language || 'en';

    // ── 1. Regex fast-path (works with no API key, handles common commands) ──
    const regexResult = regexParse(transcript, lang);
    if (regexResult) {
      const validation = PaymentIntentSchema.safeParse(regexResult);
      if (validation.success) {
        console.log('[parse-intent] Regex fast-path succeeded');
        return NextResponse.json(validation.data);
      }
    }

    // ── 2. Claude parse ───────────────────────────────────────────────────────
    let parsed = await callClaude(transcript, lang);
    console.log('[parse-intent] First attempt result:', JSON.stringify(parsed)?.substring(0, 200));

    if (parsed) {
      const validation = PaymentIntentSchema.safeParse(parsed);
      if (validation.success) {
        console.log('[parse-intent] First attempt validated successfully');
        return NextResponse.json(validation.data);
      }
      console.warn('[parse-intent] First attempt Zod validation failed:', JSON.stringify(validation.error.format()));
    }

    // ── 3. Claude retry ───────────────────────────────────────────────────────
    const retryContext = parsed
      ? 'Zod validation failed. Make sure: amount is a number, recipient has kind ("name" or "address") and value (string), confidence is "high" or "medium" or "low", ambiguities is an array of strings.'
      : 'You returned empty or non-JSON content. Respond with ONLY a JSON object, nothing else.';

    parsed = await callClaude(transcript, lang, retryContext);
    console.log('[parse-intent] Second attempt result:', JSON.stringify(parsed)?.substring(0, 200));

    if (parsed) {
      const validation = PaymentIntentSchema.safeParse(parsed);
      if (validation.success) {
        console.log('[parse-intent] Second attempt validated successfully');
        return NextResponse.json(validation.data);
      }
      console.error('[parse-intent] Second attempt Zod failed too:', JSON.stringify(validation.error.format()));

      return NextResponse.json({
        amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
        recipient: parsed.recipient && typeof parsed.recipient === 'object'
          ? parsed.recipient
          : { kind: 'name', value: '' },
        language: lang,
        confidence: 'low' as const,
        ambiguities: ['Intent parsed but validation failed. Please confirm details.'],
      });
    }

    // ── 4. Return whatever regex extracted (partial data beats empty form) ────
    if (regexResult) {
      console.warn('[parse-intent] Claude failed, returning regex partial result');
      return NextResponse.json({
        amount: typeof regexResult.amount === 'number' ? regexResult.amount : 0,
        recipient: regexResult.recipient,
        language: lang,
        confidence: 'medium' as const,
        ambiguities: ['Please confirm the details below.'],
      });
    }

    // ── 5. Complete failure ───────────────────────────────────────────────────
    console.error('[parse-intent] All parse attempts failed');
    return NextResponse.json({
      amount: 0,
      recipient: { kind: 'name', value: '' },
      language: lang,
      confidence: 'low',
      ambiguities: ['Failed to parse intent. Please fill in the details.'],
    });
  } catch (err: any) {
    console.error('[parse-intent] Route handler error:', err.message, err.stack?.substring(0, 300));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
