import { NextResponse } from 'next/server';
import { anthropic } from '@/lib/claude';
import { PaymentIntentSchema } from '@/lib/intent-schema';

const SYSTEM_PROMPT = `You are the intent parsing engine for Voz, a voice-based crypto payment app.
Your job is to extract payment intents from transcribed voice commands and output ONLY valid JSON matching the exact schema. Do not include any preamble, markdown formatting (no \`\`\`json), or conversational text.

Schema:
{
  "amount": number, // Extracted amount in USD. If ambiguous, make a best guess and mark confidence 'low' or 'medium' and list ambiguities.
  "recipient": {
    "kind": "name" | "address",
    "value": string
  },
  "message": string | undefined,
  "language": "en" | "es",
  "occasion": string | undefined, // e.g., birthday, rent, dinner
  "confidence": "high" | "medium" | "low",
  "ambiguities": string[] // List missing/ambiguous details
}

CRITICAL: Always convert spoken/written number words to numeric values.
- "two" → 2, "ten" → 10, "twenty" → 20, "fifty" → 50, "a hundred" / "one hundred" → 100
- "twenty-five" / "twenty five" → 25, "two and a half" → 2.5
- Spanish: "diez" → 10, "veinte" → 20, "cincuenta" → 50, "cien" → 100
Never return amount: 0 unless the user explicitly said "zero" or "cero".
If you cannot determine the amount, set confidence: "low" and add "amount unclear" to ambiguities — do NOT default to 0.

Examples:
Input: "Send 20 dollars to Maria"
Language: "en"
Output: {"amount":20,"recipient":{"kind":"name","value":"Maria"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send two dollars to James"
Language: "en"
Output: {"amount":2,"recipient":{"kind":"name","value":"James"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send ten dollars to James"
Language: "en"
Output: {"amount":10,"recipient":{"kind":"name","value":"James"},"language":"en","confidence":"high","ambiguities":[]}

Input: "Send twenty-five bucks to my sister Ana for groceries"
Language: "en"
Output: {"amount":25,"recipient":{"kind":"name","value":"Ana"},"occasion":"groceries","language":"en","confidence":"high","ambiguities":[]}

Input: "Send a few bucks to Carlos for his birthday"
Language: "en"
Output: {"amount":5,"recipient":{"kind":"name","value":"Carlos"},"occasion":"birthday","language":"en","confidence":"low","ambiguities":["'A few bucks' is ambiguous, defaulting to 5"]}

Input: "Envía diez dólares a María"
Language: "es"
Output: {"amount":10,"recipient":{"kind":"name","value":"María"},"language":"es","confidence":"high","ambiguities":[]}

Input: "Mándale cincuenta a Carlos para la renta"
Language: "es"
Output: {"amount":50,"recipient":{"kind":"name","value":"Carlos"},"occasion":"rent","language":"es","confidence":"high","ambiguities":[]}

Input: "Envía cincuenta a la dirección 7xKXEaabc para la renta"
Language: "es"
Output: {"amount":50,"recipient":{"kind":"address","value":"7xKXEaabc"},"occasion":"rent","language":"es","confidence":"high","ambiguities":[]}

Input: "Manda cien dólares a la address ABC123XYZ"
Language: "es"
Output: {"amount":100,"recipient":{"kind":"address","value":"ABC123XYZ"},"language":"es","confidence":"high","ambiguities":[]}

Output strictly JSON.`;

function extractJson(text: string): string {
  // Strip markdown code fences, then grab the first {...} block
  const stripped = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();
  const match = stripped.match(/\{[\s\S]*\}/);
  return match ? match[0] : stripped;
}

export async function POST(req: Request) {
  try {
    const { transcript, language } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const parseIntent = async (errorFeedback?: string) => {
      let prompt = `Input: "${transcript}"\nLanguage: "${language}"\nOutput:`;
      if (errorFeedback) {
        prompt += `\nYour previous response failed schema validation with error: ${errorFeedback}\nPlease fix and output valid JSON matching the schema.`;
      }

      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: prompt }
        ],
        temperature: 0,
      });

      const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
      console.log('[parse-intent] Claude raw response:', responseText);
      return JSON.parse(extractJson(responseText));
    };

    let rawJson;
    try {
      rawJson = await parseIntent();
      const parsed = PaymentIntentSchema.parse(rawJson);
      return NextResponse.json(parsed);
    } catch (err: any) {
      console.warn('[parse-intent] First attempt failed:', err.message);
      try {
        rawJson = await parseIntent(err.message || String(err));
        const parsed = PaymentIntentSchema.parse(rawJson);
        return NextResponse.json(parsed);
      } catch (retryErr: any) {
        console.error('[parse-intent] Second attempt failed:', retryErr.message);
        console.error('[parse-intent] Last raw JSON:', rawJson);
        return NextResponse.json({
          amount: 0,
          recipient: { kind: 'name', value: '' },
          language: language || 'en',
          confidence: 'low',
          ambiguities: ['Failed to parse intent completely. Please confirm details.'],
        });
      }
    }
  } catch (err: any) {
    console.error('[parse-intent] API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
