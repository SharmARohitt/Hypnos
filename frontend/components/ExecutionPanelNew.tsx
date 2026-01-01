"use client";

import { useState, useEffect } from "react";
import { useMetaMask } from "@/providers/MetaMaskProvider";
import { usePermissions, HypnosPermission, ExecutionAction, ExecutionResult } from "@/hooks/usePermissions";
import { motion, AnimatePresence } from "framer-motion";
import { ethers } from "ethers";
import { 
  Zap, 
  Play, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  ArrowUpRight,
  Coins,
  Hash,
  ExternalLink,
  Copy,
  Clock,
  MessageSquare,
  Send,
  Shield,
  Sparkles
} from "lucide-react";

interface ExecutionPanelProps {
  permissionId: string;
  permission?: HypnosPermission;
  onExecutionComplete: (txHash: string, result: ExecutionResult) => void;
}

const DEMO_ADDRESS = process.env.NEXT_PUBLIC_DEMO_ADDRESS || "";

const ACTIONS = [
  {
    id: "increment",
    name: "Increment Counter",
    description: "Increment the demo counter by 1",
    icon: ArrowUpRight,
    value: "0",
    type: "increment" as const,
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    iconBg: "bg-green-500/20",
  },
  {
    id: "deposit",
    name: "Deposit ETH",
    description: "Deposit 0.001 ETH to the contract",
    icon: Coins,
    value: "0.001",
    type: "deposit" as const,
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    iconBg: "bg-blue-500/20",
  },
  {
    id: "message",
    name: "Update Message",
    description: "Update the contract's stored message",
    icon: MessageSquare,
    value: "0",
    type: "updateMessage" as const,
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    iconBg: "bg-purple-500/20",
  },
];

export function ExecutionPanel({ permissionId, permission, onExecutionComplete }: ExecutionPanelProps) {
  const { account, isConnected, smartAccount } = useMetaMask();
  const { executeWithPermission, getPermissionById } = usePermissions();
  
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);
  const [customMessage, setCustomMessage] = useState("Hello from Hypnos!");
  const [customValue, setCustomValue] = useState("0.001");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [copied, setCopied] = useState(false);

  // Get permission details
  const activePermission = permission || getPermissionById(permissionId);

  const handleCopyPermissionId = () => {
    navigator.clipboard.writeText(permissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyTxHash = () => {
    if (lastTxHash) {
      navigator.clipboard.writeText(lastTxHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExecute = async () => {
    if (!isConnected || !account) {
      setError("Please connect your wallet first");
      return;
    }

    if (!permissionId) {
      setError("No active permission found");
      return;
    }

    setIsExecuting(true);
    setError(null);
    setTxStatus("pending");

    try {
      // Build execution action
      const action: ExecutionAction = {
        type: selectedAction.type,
        value: selectedAction.type === "deposit" ? customValue : selectedAction.value,
        message: selectedAction.type === "updateMessage" ? customMessage : undefined,
      };

      setTxStatus("confirming");

      // Execute with the permission
      const result = await executeWithPermission(permissionId, action);

      setExecutionResult(result);

      if (result.success) {
        setLastTxHash(result.transactionHash);
        setTxStatus("success");
        onExecutionComplete(result.transactionHash, result);
      } else {
        setError(result.error || "Transaction failed");
        setTxStatus("error");
      }
    } catch (err: any) {
      console.error("Execution error:", err);
      setError(err.reason || err.message || "Transaction failed");
      setTxStatus("error");
    } finally {
      setIsExecuting(false);
    }
  };

  const resetExecution = () => {
    setTxStatus("idle");
    setError(null);
    setLastTxHash(null);
    setExecutionResult(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Permission Info Card */}
      <div className="p-4 bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">Active Permission</span>
          </div>
          <div className="flex items-center gap-2">
            {activePermission?.isNative && (
              <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                ERC-7715
              </span>
            )}
            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-300 rounded-full">
              Active
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mb-3">
          <code className="flex-1 font-mono text-xs text-white bg-black/30 px-3 py-2 rounded-lg overflow-hidden text-ellipsis">
            {permissionId}
          </code>
          <button
            onClick={handleCopyPermissionId}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            title="Copy Permission ID"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {activePermission && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="text-gray-500 mb-1">Max Value</div>
              <div className="text-white font-medium">{activePermission.maxValue} ETH</div>
            </div>
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="text-gray-500 mb-1">Expires</div>
              <div className="text-white font-medium">
                {new Date(activePermission.expiry * 1000).toLocaleDateString()}
              </div>
            </div>
            <div className="p-2 bg-black/20 rounded-lg">
              <div className="text-gray-500 mb-1">Functions</div>
              <div className="text-white font-medium">
                {activePermission.selector === "0x00000000" ? "All" : activePermission.selector}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Action</label>
        <div className="space-y-3">
          {ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            const isSelected = selectedAction.id === action.id;
            
            return (
              <motion.button
                key={action.id}
                onClick={() => {
                  setSelectedAction(action);
                  if (txStatus !== "idle") resetExecution();
                }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${action.color} ${action.borderColor}`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center`}>
                    <ActionIcon className={`w-5 h-5 ${action.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{action.name}</div>
                    <div className="text-sm text-gray-400">{action.description}</div>
                    {action.value !== "0" && (
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                        <Coins className="w-3 h-3" />
                        Cost: {action.type === "deposit" ? customValue : action.value} ETH
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Custom Input for Message */}
      <AnimatePresence>
        {selectedAction.type === "updateMessage" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="block text-sm font-medium text-gray-300">Custom Message</label>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your message"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
          </motion.div>
        )}

        {selectedAction.type === "deposit" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 overflow-hidden"
          >
            <label className="block text-sm font-medium text-gray-300">Deposit Amount (ETH)</label>
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="0.001"
              className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
            />
            <p className="text-xs text-gray-500">
              Must not exceed your permission's max value of {activePermission?.maxValue || "0"} ETH
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execution Preview */}
      <div className="p-4 bg-gradient-to-br from-black/40 to-black/20 rounded-xl border border-white/5">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Zap className="w-3 h-3" />
          Execution Preview
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Target Contract</span>
            <span className="font-mono text-white text-xs bg-white/5 px-2 py-1 rounded">
              {DEMO_ADDRESS ? `${DEMO_ADDRESS.slice(0, 8)}...${DEMO_ADDRESS.slice(-6)}` : "Not configured"}
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Function</span>
            <span className="text-white font-medium">{selectedAction.type}()</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Value</span>
            <span className="text-white">
              {selectedAction.type === "deposit" ? customValue : selectedAction.value} ETH
            </span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-gray-400">Permission Check</span>
            <span className="text-green-400 text-xs">✓ Will be validated on-chain</span>
          </div>
          {activePermission?.isNative && (
            <div className="flex justify-between items-center py-1">
              <span className="text-gray-400">ERC-7715 Native</span>
              <span className="text-purple-400 text-xs">✓ Wallet permissions active</span>
            </div>
          )}
        </div>
      </div>

      {/* Transaction Status */}
      <AnimatePresence mode="wait">
        {txStatus !== "idle" && (
          <motion.div
            key={txStatus}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl border ${
              txStatus === "success" 
                ? "bg-green-500/10 border-green-500/30" 
                : txStatus === "error"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <div className="flex items-start gap-3">
              {txStatus === "pending" && (
                <>
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin flex-shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-blue-400">Waiting for confirmation...</div>
                    <div className="text-xs text-gray-400">Please confirm in MetaMask</div>
                  </div>
                </>
              )}
              {txStatus === "confirming" && (
                <>
                  <Clock className="w-5 h-5 text-blue-400 animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-blue-400">Transaction submitted</div>
                    <div className="text-xs text-gray-400">Waiting for blockchain confirmation...</div>
                    {lastTxHash && (
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-blue-300 font-mono bg-blue-500/10 px-2 py-1 rounded">
                          {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                        </code>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-400 hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
              {txStatus === "success" && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-green-400">Transaction successful!</div>
                    <div className="text-xs text-gray-400">AI explanation loading below...</div>
                    {lastTxHash && (
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-xs text-green-300 font-mono bg-green-500/10 px-2 py-1 rounded">
                          {lastTxHash.slice(0, 10)}...{lastTxHash.slice(-8)}
                        </code>
                        <button
                          onClick={handleCopyTxHash}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <Copy className="w-3 h-3 text-gray-400" />
                        </button>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-green-400 hover:underline"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                    {executionResult?.executionId && (
                      <div className="mt-2 text-xs text-gray-400">
                        Execution ID: <span className="font-mono text-gray-300">{executionResult.executionId}</span>
                      </div>
                    )}
                  </div>
                </>
              )}
              {txStatus === "error" && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-red-400">Transaction failed</div>
                    <div className="text-xs text-red-400/80 mt-1">{error}</div>
                    <button
                      onClick={resetExecution}
                      className="mt-2 text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Execute Button */}
      <motion.button
        onClick={handleExecute}
        disabled={isExecuting || txStatus === "success" || !DEMO_ADDRESS}
        whileHover={{ scale: isExecuting || txStatus === "success" ? 1 : 1.01 }}
        whileTap={{ scale: isExecuting || txStatus === "success" ? 1 : 0.99 }}
        className={`w-full py-4 px-6 rounded-xl font-medium flex items-center justify-center gap-3 transition-all ${
          isExecuting || txStatus === "success"
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
        }`}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Executing with Permission...</span>
          </>
        ) : txStatus === "success" ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            <span>Executed Successfully</span>
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            <span>Execute Transaction</span>
          </>
        )}
      </motion.button>

      {txStatus === "success" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={resetExecution}
          className="w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          Execute another transaction
        </motion.button>
      )}

      <p className="text-xs text-gray-500 text-center">
        The transaction will be validated against your permission before execution.
        {activePermission?.isNative && " Using ERC-7715 native wallet permissions."}
      </p>
    </motion.div>
  );
}
