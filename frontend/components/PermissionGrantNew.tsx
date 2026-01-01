"use client";

import { useState, useEffect } from "react";
import { useMetaMask } from "@/providers/MetaMaskProvider";
import { usePermissions, HypnosPermission, PERMISSION_TEMPLATES } from "@/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
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
  ChevronUp,
  Sparkles,
  Zap,
  Lock,
  Unlock,
  RefreshCw,
  ExternalLink
} from "lucide-react";

interface PermissionGrantProps {
  onPermissionGranted: (permissionId: string, permission: HypnosPermission) => void;
}

const EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS || "";
const DEMO_ADDRESS = process.env.NEXT_PUBLIC_DEMO_ADDRESS || "";

const PERMISSION_PRESETS = [
  {
    id: "counter",
    name: "Counter Demo",
    description: "Allow incrementing the demo counter",
    icon: Zap,
    targetLabel: "HypnosDemo Contract",
    maxValue: "0",
    expiry: 7,
    selector: "0x00000000",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
  },
  {
    id: "deposit",
    name: "Deposit Demo",
    description: "Allow small deposits to demo contract",
    icon: Coins,
    targetLabel: "HypnosDemo Contract",
    maxValue: "0.01",
    expiry: 1,
    selector: "0x00000000",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "custom",
    name: "Custom",
    description: "Configure your own permission",
    icon: Lock,
    targetLabel: "Custom Contract",
    maxValue: "0.01",
    expiry: 7,
    selector: "0x00000000",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
  },
];

export function PermissionGrant({ onPermissionGranted }: PermissionGrantProps) {
  const { account, isConnected, isCorrectNetwork, smartAccount, createSmartAccount } = useMetaMask();
  const { grantPermission, permissions, isLoading, error: hookError, refreshPermissions } = usePermissions();
  
  const [selectedPreset, setSelectedPreset] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGranting, setIsGranting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastGrantedPermission, setLastGrantedPermission] = useState<HypnosPermission | null>(null);
  
  // Form state
  const [targetAddress, setTargetAddress] = useState(DEMO_ADDRESS);
  const [maxValue, setMaxValue] = useState("0.01");
  const [expiryDays, setExpiryDays] = useState(7);
  const [selector, setSelector] = useState("0x00000000");
  const [useNativePermissions, setUseNativePermissions] = useState(true);

  // Update form when preset changes
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
    setError(null);
  };

  // Validate configuration
  const isConfigValid = () => {
    if (!EXECUTOR_ADDRESS || EXECUTOR_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return false;
    }
    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      return false;
    }
    return true;
  };

  // Handle permission grant
  const handleGrantPermission = async () => {
    if (!isConnected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!isCorrectNetwork) {
      setError("Please switch to Sepolia testnet");
      return;
    }

    if (!isConfigValid()) {
      setError("Invalid configuration. Please check contract addresses.");
      return;
    }

    setIsGranting(true);
    setError(null);
    
    try {
      const permission = await grantPermission({
        target: targetAddress,
        selector,
        maxValue,
        expiryDays,
        useNative: useNativePermissions,
      });

      if (permission) {
        setLastGrantedPermission(permission);
        setShowSuccess(true);
        onPermissionGranted(permission.permissionId, permission);
        
        // Auto-hide success after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      } else {
        setError("Failed to grant permission. Please try again.");
      }
    } catch (err: any) {
      console.error("Permission grant error:", err);
      setError(err.reason || err.message || "Failed to grant permission");
    } finally {
      setIsGranting(false);
    }
  };

  // Calculate expiry date
  const getExpiryDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + expiryDays);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
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
      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10 border border-purple-500/30 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="text-sm font-medium text-purple-400">ERC-7715 Advanced Permissions</div>
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                {useNativePermissions ? "Native Mode" : "On-Chain Mode"}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Grant fine-grained, time-limited permissions for specific contract interactions. 
              This enables safe AI-assisted execution without exposing private keys.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      <AnimatePresence>
        {showSuccess && lastGrantedPermission && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm font-medium text-green-400 mb-1">Permission Granted Successfully!</div>
                <p className="text-xs text-gray-400 font-mono break-all">
                  ID: {lastGrantedPermission.permissionId}
                </p>
                {lastGrantedPermission.isNative && (
                  <p className="text-xs text-green-300 mt-1">
                    ✓ Using native ERC-7715 wallet permissions
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Permission Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Permission Type</label>
        <div className="grid grid-cols-3 gap-3">
          {PERMISSION_PRESETS.map((preset, index) => {
            const Icon = preset.icon;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetChange(index)}
                className={`p-4 rounded-xl border text-left transition-all group ${
                  selectedPreset === index
                    ? `bg-gradient-to-br ${preset.color} ${preset.borderColor}`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${selectedPreset === index ? preset.textColor : 'text-gray-400'}`} />
                  <div className={`font-medium text-sm ${selectedPreset === index ? 'text-white' : 'text-gray-300'}`}>
                    {preset.name}
                  </div>
                </div>
                <div className="text-xs text-gray-400">{preset.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Details */}
      <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
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
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm font-mono text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none disabled:opacity-50 transition-colors"
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
              className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            Expiration
          </label>
          <div className="flex items-center gap-3">
            {[1, 7, 30].map((days) => (
              <button
                key={days}
                onClick={() => setExpiryDays(days)}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  expiryDays === days
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {days} day{days > 1 ? 's' : ''}
              </button>
            ))}
            <div className="flex-1">
              <input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(parseInt(e.target.value) || 1)}
                min="1"
                max="365"
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm text-center text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>
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

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-2 overflow-hidden"
            >
              <div className="space-y-2">
                <label className="text-xs text-gray-400">Function Selector</label>
                <input
                  type="text"
                  value={selector}
                  onChange={(e) => setSelector(e.target.value)}
                  placeholder="0x00000000 (any function)"
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-lg text-sm font-mono text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500">
                  Use 0x00000000 for any function, or specify a 4-byte selector
                </p>
              </div>

              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Use Native ERC-7715</span>
                </div>
                <button
                  onClick={() => setUseNativePermissions(!useNativePermissions)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    useNativePermissions ? 'bg-purple-600' : 'bg-gray-600'
                  }`}
                >
                  <motion.div
                    animate={{ x: useNativePermissions ? 24 : 2 }}
                    className="absolute top-1 w-4 h-4 bg-white rounded-full"
                  />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                When enabled, permissions are stored in your wallet (if supported) and on-chain.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Permission Summary */}
      <div className="p-4 bg-gradient-to-br from-black/40 to-black/20 rounded-xl border border-white/5">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Lock className="w-3 h-3" />
          Permission Summary
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Target</span>
            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">
              {targetAddress ? `${targetAddress.slice(0, 10)}...${targetAddress.slice(-8)}` : "Not set"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Max Value</span>
            <span className="text-white font-medium">{maxValue || "0"} ETH</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Expires</span>
            <span className="text-white">{getExpiryDate()}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Functions</span>
            <span className="text-white">{selector === "0x00000000" ? "All functions" : selector}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Mode</span>
            <span className={`text-xs px-2 py-0.5 rounded ${useNativePermissions ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {useNativePermissions ? "Native + On-Chain" : "On-Chain Only"}
            </span>
          </div>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {(error || hookError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div className="text-sm text-red-400">{error || hookError}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Warning */}
      {!isConfigValid() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3"
        >
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <div>
            <div className="text-sm text-yellow-400 font-medium">Configuration Required</div>
            <p className="text-xs text-yellow-400/80 mt-1">
              Please set NEXT_PUBLIC_EXECUTOR_ADDRESS and NEXT_PUBLIC_DEMO_ADDRESS in your .env file.
            </p>
          </div>
        </motion.div>
      )}

      {/* Grant Button */}
      <button
        onClick={handleGrantPermission}
        disabled={isGranting || isLoading || !isConfigValid() || !targetAddress}
        className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
          isGranting || isLoading || !isConfigValid()
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
        }`}
      >
        {isGranting || isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Granting Permission...
          </>
        ) : (
          <>
            <Shield className="w-5 h-5" />
            Grant ERC-7715 Permission
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        This will initiate a blockchain transaction to grant the permission.
        {useNativePermissions && " Native wallet permissions will also be requested."}
      </p>

      {/* Existing Permissions */}
      {permissions.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-300">Your Active Permissions</h4>
            <button
              onClick={refreshPermissions}
              disabled={isLoading}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {permissions.filter(p => p.active).map((permission) => (
              <div
                key={permission.id}
                className="p-3 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {permission.isNative ? (
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Lock className="w-4 h-4 text-blue-400" />
                  )}
                  <div>
                    <div className="text-xs font-mono text-gray-300">
                      {permission.permissionId.slice(0, 10)}...{permission.permissionId.slice(-8)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Expires: {new Date(permission.expiry * 1000).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    permission.isNative ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'
                  }`}>
                    {permission.isNative ? 'Native' : 'On-Chain'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
