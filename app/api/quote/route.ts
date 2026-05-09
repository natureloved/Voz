import { NextResponse } from 'next/server';
import { createConfig, getRoutes } from '@lifi/sdk';
import { TOKENS } from '@/lib/tokens';
import { SOLANA_CHAIN_ID } from '@/lib/chains';

// Minimal server-side config — no wallet providers needed for route queries
createConfig({
  integrator: process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || 'voz-dev3pack',
});

export async function POST(req: Request) {
  try {
    const { fromChainId, amount, toAddress, fromAddress } = await req.json();

    if (!fromChainId || !amount || !toAddress || !fromAddress) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const amountInWei = Math.floor(parseFloat(amount) * 1000000).toString();

    let fromTokenAddress = '';
    if (fromChainId === 8453) fromTokenAddress = TOKENS.EVM.Base_USDC;
    else if (fromChainId === 42161) fromTokenAddress = TOKENS.EVM.Arbitrum_USDC;
    else if (fromChainId === 137) fromTokenAddress = TOKENS.EVM.Polygon_USDC;
    else if (fromChainId === 10) fromTokenAddress = TOKENS.EVM.Optimism_USDC;

    if (!fromTokenAddress) {
      return NextResponse.json({ error: 'Unsupported EVM Chain' }, { status: 400 });
    }

    const response = await getRoutes({
      fromChainId: Number(fromChainId),
      toChainId: SOLANA_CHAIN_ID,
      fromTokenAddress,
      toTokenAddress: TOKENS.SOLANA.USDC,
      fromAmount: amountInWei,
      fromAddress,
      toAddress,
    });

    if (response.routes.length === 0) {
      return NextResponse.json({ error: 'No routes found' }, { status: 404 });
    }

    return NextResponse.json(response.routes[0]);
  } catch (error: any) {
    console.error("Quote API Error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
