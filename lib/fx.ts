export const SUPPORTED_CURRENCIES = ['USD', 'MXN', 'COP', 'NGN'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  USD: 'US Dollar',
  MXN: 'Mexican Peso',
  COP: 'Colombian Peso',
  NGN: 'Nigerian Naira',
};

export const CURRENCY_SYMBOLS: Record<SupportedCurrency, string> = {
  USD: '$',
  MXN: 'MX$',
  COP: 'COP$',
  NGN: '₦',
};

// CoinGecko IDs for vs_currencies param
const CG_IDS: Partial<Record<SupportedCurrency, string>> = {
  MXN: 'mxn',
  COP: 'cop',
  NGN: 'ngn',
};

// In-memory cache: currency → { rate, timestamp }
const rateCache = new Map<string, { rate: number; ts: number }>();
const CACHE_MS = 5 * 60 * 1000;

export async function getUsdRate(currency: SupportedCurrency): Promise<number> {
  if (currency === 'USD') return 1;

  const now = Date.now();
  const cached = rateCache.get(currency);
  if (cached && now - cached.ts < CACHE_MS) return cached.rate;

  const cgId = CG_IDS[currency];
  if (!cgId) return 1;

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=usd-coin&vs_currencies=${cgId}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return cached?.rate ?? 1;
    const data = await res.json();
    const rate: number = data?.['usd-coin']?.[cgId] ?? 1;
    rateCache.set(currency, { rate, ts: now });
    return rate;
  } catch {
    return cached?.rate ?? 1;
  }
}

export function convertUsd(usdAmount: number, rate: number): number {
  return Math.round(usdAmount * rate * 100) / 100;
}
