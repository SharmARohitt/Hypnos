"use client";

import { useMetaMask } from "@/hooks/useMetaMask";
import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { 
  Shield, 
  Target, 
  Clock, 
  Coins, 
  Info, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface PermissionGrantProps {
  onPermissionGranted: (permissionId: string) => void;
}

const EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS || "0x0000000000000000000000000000000000000000";
const DEMO_ADDRESS = process.env.NEXT_PUBLIC_DEMO_ADDRESS || "0x0000000000000000000000000000000000000000";

const EXECUTOR_ABI = [
  "function grantPermission(address executor, address target, bytes4 selector, uint256 maxValue, uint256 maxTokenAmount, address tokenAddress, uint256 expiry) external returns (bytes32)",
  "event PermissionGranted(address indexed user, bytes32 indexed permissionId, address target, bytes4 selector, uint256 maxValue, uint256 maxTokenAmount, address tokenAddress, uint256 expiry)",
];

const PERMISSION_PRESETS = [
  {
    name: "Counter Demo",
    description: "Allow incrementing the demo counter",
    targetLabel: "HypnosDemo Contract",
    maxValue: "0",
    expiry: 7,
    selector: "0x00000000", // any function
  },
  {
    name: "Deposit Demo",
    description: "Allow small deposits to demo contract",
    targetLabel: "HypnosDemo Contract",
    maxValue: "0.01",
    expiry: 1,
    selector: "0x00000000",
  },
  {
    name: "Custom",
    description: "Configure your own permission",
    targetLabel: "Custom Contract",
    maxValue: "0.01",
    expiry: 7,
    selector: "0x00000000",
  },
];

export function PermissionGrant({ onPermissionGranted }: PermissionGrantProps) {
  const { signer, account, isConnected, isCorrectNetwork } = useMetaMask();
  const [isGranting, setIsGranting] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [targetAddress, setTargetAddress] = useState(DEMO_ADDRESS);
  const [maxValue, setMaxValue] = useState("0.01");
  const [expiryDays, setExpiryDays] = useState(7);
  const [selector, setSelector] = useState("0x00000000");

  const handlePresetChange = (index: number) => {
    setSelectedPreset(index);
    const preset = PERMISSION_PRESETS[index];
    setMaxValue(preset.maxValue);
    setExpiryDays(preset.expiry);
    setSelector(preset.selector);
    if (index < 2) {
      setTargetAddress(DEMO_ADDRESS);
    }
    setShowAdvanced(index === 2);
  };

  const handleGrantPermission = async () => {
    if (!signer || !account || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Please switch to Sepolia testnet");
      return;
    }

    if (!EXECUTOR_ADDRESS || EXECUTOR_ADDRESS === "0x0000000000000000000000000000000000000000") {
      setError("Executor contract address not configured. Set NEXT_PUBLIC_EXECUTOR_ADDRESS in .env");
      return;
    }

    setIsGranting(true);
    setError(null);
    
    try {
      const executorContract = new ethers.Contract(
        EXECUTOR_ADDRESS,
        EXECUTOR_ABI,
        signer
      );

      const expiry = Math.floor(Date.now() / 1000) + expiryDays * 24 * 60 * 60;
      const maxValueWei = ethers.parseEther(maxValue || "0");
      const maxTokenAmount = 0;
      const tokenAddress = ethers.ZeroAddress;

      const tx = await executorContract.grantPermission(
        account,
        targetAddress,
        selector,
        maxValueWei,
        maxTokenAmount,
        tokenAddress,
        expiry
      );

      const receipt = await tx.wait();

      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = executorContract.interface.parseLog(log);
          return parsed?.name === "PermissionGranted";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = executorContract.interface.parseLog(event);
        const permissionId = parsed?.args[1];
        if (permissionId) {
          onPermissionGranted(permissionId);
        }
      }
    } catch (err: any) {
      console.error("Permission grant error:", err);
      setError(err.reason || err.message || "Failed to grant permission");
    } finally {
      setIsGranting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl text-gray-400">
        <Info className="w-5 h-5" />
        <span className="text-sm">Please connect your wallet first</span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* ERC-7715 Info Banner */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-purple-400 mb-1">ERC-7715 Advanced Permissions</div>
            <p className="text-xs text-gray-400">
              Grant fine-grained, time-limited permissions for specific contract interactions. 
              This enables safe AI-assisted execution without exposing private keys.
            </p>
          </div>
        </div>
      </div>

      {/* Permission Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Permission Type</label>
        <div className="grid grid-cols-3 gap-3">
          {PERMISSION_PRESETS.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetChange(index)}
              className={`p-4 rounded-xl border text-left transition-all ${
                selectedPreset === index
                  ? 'bg-hypnos-primary/20 border-hypnos-primary'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="font-medium text-sm text-white mb-1">{preset.name}</div>
              <div className="text-xs text-gray-400">{preset.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Permission Details */}
      <div className="space-y-4 p-4 bg-white/5 rounded-xl">
        <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Permission Configuration
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <Target className="w-3 h-3" />
              Target Contract
            </label>
            <input
              type="text"
              value={targetAddress}
              onChange={(e) => setTargetAddress(e.target.value)}
              disabled={selectedPreset < 2}
              placeholder="0x..."
              className="input-field text-sm font-mono disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              <Coins className="w-3 h-3" />
              Max Value (ETH)
            </label>
            <input
              type="text"
              value={maxValue}
              onChange={(e) => setMaxValue(e.target.value)}
              placeholder="0.01"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Expiration
          </label>
          <div className="flex items-center gap-4">
            {[1, 7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setExpiryDays(days)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                  expiryDays === days
                    ? 'bg-hypnos-primary text-white'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {days} day{days > 1 ? 's' : ''}
              </button>
            ))}
            <input
              type="number"
              value={expiryDays}
              onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
              min="1"
              max="365"
              className="input-field w-20 text-sm text-center"
            />
          </div>
        </div>

        {/* Advanced Options */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          Advanced Options
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-3 pt-2"
          >
            <div className="space-y-2">
              <label className="text-xs text-gray-400">Function Selector</label>
              <input
                type="text"
                value={selector}
                onChange={(e) => setSelector(e.target.value)}
                placeholder="0x00000000 (any function)"
                className="input-field text-sm font-mono"
              />
              <p className="text-xs text-gray-500">
                Use 0x00000000 for any function, or specify a 4-byte selector
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Permission Summary */}
      <div className="p-4 bg-black/30 rounded-xl border border-white/5">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Permission Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Target</span>
            <span className="font-mono text-white">{targetAddress.slice(0, 8)}...{targetAddress.slice(-6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Value</span>
            <span className="text-white">{maxValue || "0"} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Expires</span>
            <span className="text-white">{expiryDays} day{expiryDays > 1 ? 's' : ''} from now</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Functions</span>
            <span className="text-white">{selector === "0x00000000" ? "All functions" : selector}</span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-400">{error}</div>
        </motion.div>
      )}

      {/* Grant Button */}
      <button
        onClick={handleGrantPermission}
        disabled={isGranting || !targetAddress}
        className="w-full btn-primary flex items-center justify-center gap-2"
      >
        {isGranting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Granting Permission...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Grant Permission
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        This will initiate a blockchain transaction to grant the permission on-chain.
      </p>
    </motion.div>
  );
}
