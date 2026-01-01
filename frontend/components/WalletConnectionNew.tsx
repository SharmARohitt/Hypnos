"use client";

import { useMetaMask } from "@/providers/MetaMaskProvider";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Wallet, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  RefreshCw,
  LogOut,
  Loader2,
  Sparkles,
  Shield,
  Zap
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
    isConnecting, 
    chainId, 
    isCorrectNetwork,
    switchToSepolia,
    balance,
    smartAccount,
    hasSmartAccount,
    grantedPermissions
  } = useMetaMask();
  
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (isConnected && isCorrectNetwork && onConnected) {
      onConnected();
    }
  }, [isConnected, isCorrectNetwork, onConnected]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection failed:", error);
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

  // Not connected state
  if (!isConnected || !account) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* MetaMask SDK Banner */}
        <div className="p-4 bg-gradient-to-r from-orange-500/10 via-yellow-500/10 to-orange-500/10 border border-orange-500/20 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-orange-400">MetaMask SDK Integration</div>
              <p className="text-xs text-gray-400">
                Connect with advanced features including ERC-7715 permissions
              </p>
            </div>
          </div>
        </div>

        {/* Connect Button */}
        <motion.button
          onClick={handleConnect}
          disabled={isConnecting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${
            isConnecting 
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
          }`}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              <span>Connect MetaMask</span>
            </>
          )}
        </motion.button>

        <p className="text-xs text-gray-500 text-center">
          By connecting, you agree to use the Sepolia testnet for this demo.
        </p>
      </motion.div>
    );
  }

  // Connected state
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
          <div className="text-sm font-medium text-green-400 flex items-center gap-2">
            Wallet Connected
            <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              SDK
            </span>
          </div>
          <div className="text-xs text-gray-400">Ready to interact with Hypnos</div>
        </div>
      </div>

      {/* Network Warning */}
      <AnimatePresence>
        {!isCorrectNetwork && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl"
          >
            <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-400">Wrong Network</div>
              <div className="text-xs text-gray-400">
                Currently on {getNetworkName(chainId)}. Switch to Sepolia.
              </div>
            </div>
            <button
              onClick={switchToSepolia}
              className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 text-sm rounded-lg transition-colors"
            >
              Switch
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Account Info Card */}
      <div className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-mono text-sm text-white">
                  {account.slice(0, 8)}...{account.slice(-6)}
                </div>
                <div className="text-xs text-gray-400">
                  {balance ? `${parseFloat(balance).toFixed(4)} ETH` : "Loading..."}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCorrectNetwork && (
                <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full">
                  Sepolia
                </span>
              )}
            </div>
          </div>
        </button>

        {/* Expanded Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-white/10 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Full Address</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs text-white font-mono bg-black/30 px-2 py-1 rounded">
                    {account}
                  </code>
                  <button
                    onClick={handleCopyAddress}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Network</span>
                <span className="text-xs text-white">{getNetworkName(chainId)}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Chain ID</span>
                <span className="text-xs text-white font-mono">{chainId}</span>
              </div>

              {grantedPermissions.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Active Permissions
                  </span>
                  <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                    {grantedPermissions.length}
                  </span>
                </div>
              )}

              <a
                href={`https://sepolia.etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
              >
                View on Etherscan <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Feature Indicators */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium text-white">ERC-7715</span>
          </div>
          <span className="text-xs text-gray-400">Advanced Permissions</span>
        </div>
        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-white">SDK</span>
          </div>
          <span className="text-xs text-gray-400">MetaMask Integrated</span>
        </div>
      </div>

      {/* Disconnect Button */}
      <button
        onClick={disconnect}
        className="w-full py-2 text-sm text-gray-400 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Disconnect Wallet
      </button>
    </motion.div>
  );
}
