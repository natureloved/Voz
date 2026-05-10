import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/Button';

export function EvmConnectButton() {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button" className="text-xs px-3">
                    Connect EVM
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} type="button" className="bg-red-500 text-white">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <Button
                    onClick={openChainModal}
                    type="button"
                    className="hidden sm:flex items-center bg-ocean/10 text-ocean hover:bg-ocean/20 text-xs px-2"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 14,
                          height: 14,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                          flexShrink: 0,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 14, height: 14 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal} type="button" className="bg-ocean/10 text-ocean hover:bg-ocean/20 text-xs px-2 sm:px-3">
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
