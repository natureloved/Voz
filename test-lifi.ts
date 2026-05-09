import { createConfig, getRoutes, EVM, Solana } from '@lifi/sdk';

createConfig({
  integrator: 'voz-dev3pack',
  providers: [EVM(), Solana()],
});

async function main() {
  try {
    const response = await getRoutes({
      fromChainId: 8453,
      toChainId: 1151111081099710,
      fromTokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      toTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      fromAmount: '10000000',
      fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
      toAddress: '11111111111111111111111111111111',
    });
    console.log(`Routes found: ${response.routes.length}`);
    if (response.routes.length > 0) {
      console.log(`Best route tool: ${response.routes[0].steps[0].tool}`);
    }
  } catch (err) {
    console.error('LIFI ERROR:', err);
  }
}
main();
