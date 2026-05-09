import { z } from 'zod';

export const PaymentIntentSchema = z.object({
  amount: z.number().describe('Amount in USD'),
  recipient: z.object({
    kind: z.enum(['name', 'address']),
    value: z.string(),
  }),
  message: z.string().optional().describe('Message to the recipient'),
  language: z.enum(['en', 'es']),
  occasion: z.string().optional().describe('Context of the payment: birthday, rent, dinner, etc'),
  confidence: z.enum(['high', 'medium', 'low']),
  ambiguities: z.array(z.string()).describe('List of ambiguities or missing details if confidence is not high'),
});

export type PaymentIntent = z.infer<typeof PaymentIntentSchema>;
