"use client";

import { useMetaMask } from "@/hooks/useMetaMask";
import { useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
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
  Clock
} from "lucide-react";

interface ExecutionPanelProps {
  permissionId: string;
  onExecutionComplete: (txHash: string) => void;
}

const EXECUTOR_ADDRESS = process.env.NEXT_PUBLIC_EXECUTOR_ADDRESS || "";
const DEMO_ADDRESS = process.env.NEXT_PUBLIC_DEMO_ADDRESS || "";

const EXECUTOR_ABI = [
  "function executeWithPermission(bytes32 permissionId, address target, bytes calldata data, uint256 value) external returns (bool success, bytes memory returnData)",
];

const DEMO_ABI = [
  "function incrementCounter() external returns (uint256)",
  "function deposit() external payable",
  "function updateMessage(string calldata newMessage) external",
];

const ACTIONS = [
  {
    id: "increment",
    name: "Increment Counter",
    description: "Increment the demo counter by 1",
    icon: ArrowUpRight,
    value: "0",
    function: "incrementCounter",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
  },
  {
    id: "deposit",
    name: "Deposit ETH",
    description: "Deposit 0.001 ETH to the contract",
    icon: Coins,
    value: "0.001",
    function: "deposit",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "message",
    name: "Update Message",
    description: "Update the contract's stored message",
    icon: Hash,
    value: "0",
    function: "updateMessage",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
  },
];

export function ExecutionPanel({ permissionId, onExecutionComplete }: ExecutionPanelProps) {
  const { signer, account, isConnected } = useMetaMask();
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedAction, setSelectedAction] = useState(ACTIONS[0]);
  const [customMessage, setCustomMessage] = useState("Hello from Hypnos!");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "pending" | "confirming" | "success" | "error">("idle");
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyPermissionId = () => {
    navigator.clipboard.writeText(permissionId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    if (!signer || !account || !isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsExecuting(true);
    setError(null);
    setTxStatus("pending");

    try {
      const executorContract = new ethers.Contract(
        EXECUTOR_ADDRESS,
        EXECUTOR_ABI,
        signer
      );

      const demoInterface = new ethers.Interface(DEMO_ABI);
      let data: string;
      let value = 0n;

      switch (selectedAction.function) {
        case "incrementCounter":
          data = demoInterface.encodeFunctionData("incrementCounter", []);
          break;
        case "deposit":
          data = demoInterface.encodeFunctionData("deposit", []);
          value = ethers.parseEther("0.001");
          break;
        case "updateMessage":
          data = demoInterface.encodeFunctionData("updateMessage", [customMessage]);
          break;
        default:
          data = "0x";
      }

      setTxStatus("confirming");

      const tx = await executorContract.executeWithPermission(
        permissionId,
        DEMO_ADDRESS,
        data,
        value,
        { value }
      );

      setLastTxHash(tx.hash);
      
      const receipt = await tx.wait();
      
      setTxStatus("success");
      onExecutionComplete(receipt.hash);
    } catch (err: any) {
      console.error("Execution error:", err);
      setError(err.reason || err.message || "Transaction failed");
      setTxStatus("error");
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Permission Info */}
      <div className="p-4 bg-white/5 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Active Permission</span>
          <div className="badge badge-success">Active</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-white">
            {permissionId.slice(0, 10)}...{permissionId.slice(-8)}
          </span>
          <button
            onClick={handleCopyPermissionId}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            {copied ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Action Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">Select Action</label>
        <div className="space-y-3">
          {ACTIONS.map((action) => {
            const ActionIcon = action.icon;
            const isSelected = selectedAction.id === action.id;
            
            return (
              <button
                key={action.id}
                onClick={() => setSelectedAction(action)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${action.color} ${action.borderColor}`
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                    <ActionIcon className={`w-5 h-5 ${action.textColor}`} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white mb-1">{action.name}</div>
                    <div className="text-sm text-gray-400">{action.description}</div>
                    {action.value !== "0" && (
                      <div className="text-xs text-gray-500 mt-1">
                        Cost: {action.value} ETH
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Message Input (for updateMessage action) */}
      {selectedAction.function === "updateMessage" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-2"
        >
          <label className="block text-sm font-medium text-gray-300">Custom Message</label>
          <input
            type="text"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Enter your message"
            className="input-field"
          />
        </motion.div>
      )}

      {/* Execution Details */}
      <div className="p-4 bg-black/30 rounded-xl border border-white/5">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Execution Preview
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Target Contract</span>
            <span className="font-mono text-white">{DEMO_ADDRESS.slice(0, 6)}...{DEMO_ADDRESS.slice(-4)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Function</span>
            <span className="text-white">{selectedAction.function}()</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Value</span>
            <span className="text-white">{selectedAction.value} ETH</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Permission Check</span>
            <span className="text-green-400">Will be validated on-chain</span>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      {txStatus !== "idle" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            txStatus === "success" 
              ? "bg-green-500/10 border-green-500/30" 
              : txStatus === "error"
              ? "bg-red-500/10 border-red-500/30"
              : "bg-blue-500/10 border-blue-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            {txStatus === "pending" && (
              <>
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <div>
                  <div className="text-sm font-medium text-blue-400">Waiting for confirmation...</div>
                  <div className="text-xs text-gray-400">Please confirm in MetaMask</div>
                </div>
              </>
            )}
            {txStatus === "confirming" && (
              <>
                <Clock className="w-5 h-5 text-blue-400 animate-pulse" />
                <div>
                  <div className="text-sm font-medium text-blue-400">Transaction submitted</div>
                  <div className="text-xs text-gray-400">Waiting for blockchain confirmation...</div>
                  {lastTxHash && (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${lastTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-blue-400 hover:underline mt-1"
                    >
                      View on Etherscan <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </>
            )}
            {txStatus === "success" && (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-green-400">Transaction successful!</div>
                  <div className="text-xs text-gray-400">AI explanation loading below...</div>
                </div>
              </>
            )}
            {txStatus === "error" && (
              <>
                <AlertCircle className="w-5 h-5 text-red-400" />
                <div className="text-sm text-red-400">{error}</div>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* Execute Button */}
      <button
        onClick={handleExecute}
        disabled={isExecuting || txStatus === "success"}
        className="w-full btn-accent flex items-center justify-center gap-2"
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Executing...
          </>
        ) : txStatus === "success" ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            Executed Successfully
          </>
        ) : (
          <>
            <Play className="w-5 h-5" />
            Execute Transaction
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        The transaction will be validated against your permission before execution.
      </p>
    </motion.div>
  );
}
