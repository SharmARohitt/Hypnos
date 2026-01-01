"use client";

import { useMetaMask } from "@/hooks/useMetaMask";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Wallet, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  LogOut,
  Loader2
} from "lucide-react";

interface WalletConnectionProps {
  onConnected?: () => void;
}

export function WalletConnection({ onConnected }: WalletConnectionProps) {
  const { 
    account, 
    connect, 
    disconnect,
    isConnected, 
    chainId, 
    isCorrectNetwork,
    switchToSepolia,
    balance 
  } = useMetaMask();
  const [isConnecting, setIsConnecting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isConnected && isCorrectNetwork && onConnected) {
      onConnected();
    }
  }, [isConnected, isCorrectNetwork, onConnected]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getNetworkName = (id: number | null) => {
    switch (id) {
      case 1: return "Ethereum Mainnet";
      case 11155111: return "Sepolia Testnet";
      case 5: return "Goerli Testnet";
      case 137: return "Polygon";
      case 80001: return "Mumbai";
      default: return `Chain ${id}`;
    }
  };

  if (isConnected && account) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-4"
      >
        {/* Connection Status */}
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-green-400">Wallet Connected</div>
            <div className="text-xs text-gray-400">Ready to interact with Hypnos</div>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-4 bg-white/5 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Address</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-white">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button
                onClick={handleCopyAddress}
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="Copy address"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-gray-400" />
                )}
              </button>
              <a
                href={`https://sepolia.etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 hover:bg-white/10 rounded transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="font-mono text-sm text-white">{balance || "0.0000"} ETH</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Network</span>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isCorrectNetwork ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className={`text-sm ${isCorrectNetwork ? 'text-white' : 'text-yellow-400'}`}>
                {getNetworkName(chainId)}
              </span>
            </div>
          </div>
        </div>

        {/* Network Warning */}
        {!isCorrectNetwork && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-400 mb-1">Wrong Network</div>
                <p className="text-xs text-gray-400 mb-3">
                  Please switch to Sepolia testnet to use Hypnos demo.
                </p>
                <button
                  onClick={switchToSepolia}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Switch to Sepolia
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Disconnect Button */}
        <button
          onClick={disconnect}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl text-sm transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Disconnect Wallet
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <p className="text-sm text-gray-400 mb-4">
        Connect your MetaMask wallet to interact with the Hypnos demo on Sepolia testnet. 
        You'll need some testnet ETH for transactions.
      </p>

      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="w-full btn-primary flex items-center justify-center gap-3"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-5 h-5" />
            Connect MetaMask
          </>
        )}
      </button>

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <a 
          href="https://metamask.io/download/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          Get MetaMask
        </a>
        <span>•</span>
        <a 
          href="https://sepoliafaucet.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hover:text-white transition-colors"
        >
          Get Sepolia ETH
        </a>
      </div>
    </motion.div>
  );
}
