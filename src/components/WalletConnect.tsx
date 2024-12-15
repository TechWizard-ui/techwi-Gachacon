import { useState } from 'react';
import { useLucid } from '../context/LucidProvider';

const WALLET_CONFIGS = {
  lace: {
    icon: 'L',
    color: 'from-purple-500 to-blue-600',
    hoverEffect: 'hover:shadow-purple-500/50',
  },

};

export function WalletConnect() {
  const { connectWallet, disconnectWallet, address } = useLucid();
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<string | null>(null);
  console.log(selectedWallet);
  const handleConnect = async (walletName: string) => {
    try {
      setIsConnecting(true);
      setSelectedWallet(walletName);
      setError(null);
      await connectWallet(walletName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
      setSelectedWallet(null);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 8)}...${addr.slice(-8)}`;

  return (
    <div className="inline-block">
      {!address ? (
        <button
          onClick={() => handleConnect('nami')}
          disabled={isConnecting}
          className={`
            px-4 py-2 rounded-lg
            bg-gradient-to-r from-purple-500 to-blue-600
            hover:shadow-lg hover:shadow-purple-500/30
            transform transition-all duration-200
            ${isConnecting ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
        >
          <div className="flex items-center space-x-2">
            <span>{WALLET_CONFIGS.lace.icon}</span>
            <span>
              {isConnecting ? 'Connecting...' : 'Connect Wallet'}
            </span>
          </div>
        </button>
      ) : (
        <button
          onClick={disconnectWallet}
          className="
            px-4 py-2 rounded-lg
            bg-gradient-to-r from-purple-500 to-blue-600
            hover:shadow-lg hover:shadow-purple-500/30
            transform transition-all duration-200
            hover:scale-105
          "
        >
          <div className="flex items-center space-x-2">
            <span>{WALLET_CONFIGS.lace.icon}</span>
              <span>{formatAddress(address)}</span>
          </div>
        </button>
      )}
      {error && (
        <div className="mt-2 text-sm text-red-500">
          {error}
        </div>
      )}
    </div>
  );
} 