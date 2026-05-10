import type { PaymentIntent } from './intent-schema';
import type { Contact } from './contacts';

export const DEMO_TRANSCRIPT = "Send 25 dollars to Maria for her birthday";

export const DEMO_INTENT: PaymentIntent = {
  amount: 25,
  recipient: { kind: 'address', value: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU' },
  message: "Happy birthday, Maria! Wishing you all the love and joy today.",
  language: 'en',
  occasion: 'birthday',
  confidence: 'high',
  ambiguities: [],
};

export const DEMO_CONTACT: Contact = {
  id: 'demo-contact-maria',
  name: 'Maria García',
  solanaAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  language: 'es',
  createdAt: '2025-01-01T00:00:00.000Z',
};

// Plausible-looking mock LiFi route (shape RouteCard needs)
export const DEMO_ROUTE = {
  id: 'demo-route-1',
  fromChainId: 8453,
  toChainId: 1151111081099710,
  fromAmountUSD: '25.00',
  toAmountUSD: '24.87',
  gasCostUSD: '0.0031',
  steps: [
    {
      id: 'demo-step-1',
      tool: 'Stargate',
      action: {
        fromChainId: 8453,
        fromToken: { symbol: 'USDC', decimals: 6, address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' },
        toToken: { symbol: 'USDC', decimals: 6 },
      },
      estimate: {
        executionDuration: 420,
        feeCosts: [{ amountUSD: '0.0850', name: 'Protocol Fee' }],
        gasCosts: [{ amountUSD: '0.0031', estimate: '75000' }],
        fromAmount: '25000000',
        toAmount: '24870000',
        toAmountMin: '24745650',
      },
    },
  ],
} as const;

// Mock execution timeline — each step with timing (ms)
export const DEMO_TIMELINE = [
  { id: 'approve', label: 'Approving USDC on Base',    activateAt: 0,    doneAt: 1800 },
  { id: 'bridge',  label: 'Bridging via Stargate',     activateAt: 1900, doneAt: 5400 },
  { id: 'solana',  label: 'Confirming on Solana',      activateAt: 5500, doneAt: 7000 },
  { id: 'done',    label: 'Done',                       activateAt: 7100, doneAt: 7400 },
];

export const DEMO_TX_HASH =
  '5A3BtFzXkMvPqReLsNpYwCjUhDgE2mKoViQSaI1HbZXyTWn4cF8uJ6dA7rOsG9';

export const DEMO_HISTORY = [
  {
    id: 'demo-hist-1',
    amount: 25,
    fromChain: 8453,
    toSolanaAddress: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    recipientName: 'Maria García',
    recipientLanguage: 'es' as const,
    senderMessageOriginal: 'Happy birthday, Maria! Wishing you all the love today.',
    senderLanguage: 'en' as const,
    occasion: 'birthday',
    txHash: '5A3BtFzXkMvPqReLsNpYwCjUhDgE2mKoViQSaI1HbZXyTWn4cF8uJ6dA7rOsG9',
    status: 'confirmed' as const,
    createdAt: '2025-05-08T14:22:00.000Z',
    claimedAt: '2025-05-08T14:45:00.000Z',
  },
  {
    id: 'demo-hist-2',
    amount: 50,
    fromChain: 42161,
    toSolanaAddress: '4Nd1mBQtrMJVYVfKf2PX98q4YCJ1KqvDt1pSCTFH8HiK',
    recipientName: 'Carlos',
    recipientLanguage: 'es' as const,
    senderMessageOriginal: 'Thanks for your help last week, really appreciate it!',
    senderLanguage: 'en' as const,
    txHash: '3HjkLmNpQrStUvWxAbCdEfGhIjKlMnOpQrStUvWxYz1234567890abcdef678901',
    status: 'confirmed' as const,
    createdAt: '2025-05-05T09:10:00.000Z',
    claimedAt: '2025-05-05T09:30:00.000Z',
  },
  {
    id: 'demo-hist-3',
    amount: 15,
    fromChain: 137,
    toSolanaAddress: '9WzDXwBbmkg8ZTbNMqUxvQWVbjScRsQUvpEkAMr9w7k6',
    recipientName: 'Abuela Rosa',
    recipientLanguage: 'es' as const,
    senderMessageOriginal: 'Te quiero mucho, abuela. Cuídate.',
    senderLanguage: 'es' as const,
    txHash: '7YzAbCdEfGhIjKlMnOpQrStUvWxYz1AbCdEfGhIjKlMnOpQrStUvWxYz98765432',
    status: 'confirmed' as const,
    createdAt: '2025-05-01T18:00:00.000Z',
  },
] as const;

export const DEMO_TRANSFER_BASE = {
  amount: 25,
  fromChain: 8453,
  toSolanaAddress: DEMO_CONTACT.solanaAddress,
  recipientName: DEMO_CONTACT.name,
  recipientLanguage: DEMO_CONTACT.language,
  senderName: 'Demo Sender',
  senderMessageOriginal: DEMO_INTENT.message ?? '',
  senderLanguage: DEMO_INTENT.language,
  occasion: DEMO_INTENT.occasion,
  txHash: DEMO_TX_HASH,
  status: 'confirmed' as const,
};
