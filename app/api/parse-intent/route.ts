import { NextResponse } from 'next/server';
import { PaymentIntentSchema } from '@/lib/intent-schema';
import Anthropic from '@anthropic-ai/sdk';

// Initialize client directly to avoid any import issues
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

function extractJson(text: string): Record<string, unknown> | null {
  if (!text || text.trim().length === 0) {
    console.error('[parse-intent] Empty response from Claude');
    return null;
  }

  // Strip markdown fences
  const cleaned = text
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .trim();

  // Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to extract JSON object from within the text
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

async function callClaude(transcript: string, language: string, retryContext?: string): Promise<Record<string, unknown> | null> {
  let userMessage = `Input: "${transcript}"\nLanguage: "${language}"`;
  if (retryContext) {
    userMessage += `\n\nYour previous response was invalid: ${retryContext}\nPlease respond with ONLY a valid JSON object matching the schema.`;
  }

  console.log('[parse-intent] Calling Claude with:', userMessage.substring(0, 100));

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 512,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    console.log('[parse-intent] Claude response stop_reason:', message.stop_reason);
    console.log('[parse-intent] Claude response content type:', message.content[0]?.type);

    const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
    console.log('[parse-intent] Claude raw text:', responseText.substring(0, 300));

    if (!responseText) {
      console.error('[parse-intent] Claude returned empty text content');
      return null;
    }

    return extractJson(responseText);
  } catch (err: any) {
    console.error('[parse-intent] Claude API call failed:', err.message);
    console.error('[parse-intent] Error type:', err.constructor?.name);
    if (err.status) console.error('[parse-intent] HTTP status:', err.status);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transcript, language } = body;

    console.log('[parse-intent] Received:', { transcript, language });

    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    // First attempt
    let parsed = await callClaude(transcript, language || 'en');
    console.log('[parse-intent] First attempt result:', JSON.stringify(parsed)?.substring(0, 200));

    if (parsed) {
      const validation = PaymentIntentSchema.safeParse(parsed);
      if (validation.success) {
        console.log('[parse-intent] First attempt validated successfully');
        return NextResponse.json(validation.data);
      }
      console.warn('[parse-intent] First attempt Zod validation failed:', JSON.stringify(validation.error.format()));
    }

    // Second attempt with error context
    const retryContext = parsed
      ? `Zod validation failed. Make sure: amount is a number, recipient has kind ("name" or "address") and value (string), confidence is "high" or "medium" or "low", ambiguities is an array of strings.`
      : 'You returned empty or non-JSON content. Respond with ONLY a JSON object, nothing else.';

    parsed = await callClaude(transcript, language || 'en', retryContext);
    console.log('[parse-intent] Second attempt result:', JSON.stringify(parsed)?.substring(0, 200));

    if (parsed) {
      const validation = PaymentIntentSchema.safeParse(parsed);
      if (validation.success) {
        console.log('[parse-intent] Second attempt validated successfully');
        return NextResponse.json(validation.data);
      }
      console.error('[parse-intent] Second attempt Zod failed too:', JSON.stringify(validation.error.format()));

      // Try to salvage what we can from the parsed object
      return NextResponse.json({
        amount: typeof parsed.amount === 'number' ? parsed.amount : 0,
        recipient: parsed.recipient && typeof parsed.recipient === 'object'
          ? parsed.recipient
          : { kind: 'name', value: '' },
        language: language || 'en',
        confidence: 'low' as const,
        ambiguities: ['Intent parsed but validation failed. Please confirm details.'],
      });
    }

    // Complete failure
    console.error('[parse-intent] Both attempts returned null');
    return NextResponse.json({
      amount: 0,
      recipient: { kind: 'name', value: '' },
      language: language || 'en',
      confidence: 'low',
      ambiguities: ['Failed to parse intent completely. Please confirm details.'],
    });
  } catch (err: any) {
    console.error('[parse-intent] Route handler error:', err.message, err.stack?.substring(0, 300));
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
