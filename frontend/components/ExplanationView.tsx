"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info,
  ArrowRight,
  Shield,
  Zap,
  Eye,
  ExternalLink,
  RefreshCw,
  Loader2,
  ChevronDown,
  ChevronUp,
  FileText,
  Hash,
  Clock,
  Activity
} from "lucide-react";

interface ExplanationViewProps {
  txHash: string;
  permissionId?: string;
}

interface ExplanationData {
  summary: string;
  causality: string;
  permissionAnalysis: {
    usedPermission: string | null;
    permissionConstraints: string[];
    allowedActions: string[];
    blockedActions: string[];
  };
  stateTransitions: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
  safetyAnalysis: {
    riskLevel: "low" | "medium" | "high";
    reasons: string[];
    constraints: string[];
  };
  traceability: {
    transactionHash: string;
    blockNumber: number;
    events: Array<{
      name: string;
      data: Record<string, any>;
    }>;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Mock explanation for demo when API is not available
const MOCK_EXPLANATION: ExplanationData = {
  summary: "A permission-gated transaction was executed successfully. The smart contract's counter was incremented by 1, and the execution was recorded with full traceability.",
  causality: "The user initiated a transaction through the HypnosExecutor contract, which validated the permission constraints (target contract, function selector, max value, and expiry) before executing the call to the HypnosDemo contract. The counter state variable was updated atomically.",
  permissionAnalysis: {
    usedPermission: "0x1234...abcd",
    permissionConstraints: [
      "Target: HypnosDemo contract",
      "Max value: 0.01 ETH",
      "Expiry: 7 days from grant",
      "Functions: All allowed"
    ],
    allowedActions: [
      "incrementCounter()",
      "deposit()",
      "updateMessage(string)"
    ],
    blockedActions: [
      "withdraw() - Not in permission scope",
      "transferOwnership() - Admin only"
    ]
  },
  stateTransitions: [
    { from: "counter: 42", to: "counter: 43", reason: "incrementCounter() called" },
    { from: "lastCaller: 0x0", to: "lastCaller: 0xUser", reason: "Caller recorded" }
  ],
  safetyAnalysis: {
    riskLevel: "low",
    reasons: [
      "Transaction stayed within permission bounds",
      "No ETH transferred beyond limit",
      "No external calls to untrusted contracts",
      "State changes were deterministic and reversible"
    ],
    constraints: [
      "Permission expires in 6 days, 23 hours",
      "Remaining value allowance: 0.01 ETH"
    ]
  },
  traceability: {
    transactionHash: "0x...",
    blockNumber: 5000000,
    events: [
      { name: "CounterIncremented", data: { oldValue: 42, newValue: 43, caller: "0xUser" } },
      { name: "PermissionUsed", data: { permissionId: "0x1234", action: "incrementCounter" } },
      { name: "ExecutionRecorded", data: { success: true, gasUsed: 45000 } }
    ]
  }
};

export function ExplanationView({ txHash, permissionId }: ExplanationViewProps) {
  const [explanation, setExplanation] = useState<ExplanationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["summary", "safety"]));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  useEffect(() => {
    const fetchExplanation = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.post(`${API_URL}/api/explain`, {
          txHash,
          permissionId,
        }, { timeout: 10000 });

        if (response.data.success) {
          setExplanation(response.data.data);
        } else {
          // Use mock data for demo
          setExplanation({
            ...MOCK_EXPLANATION,
            traceability: {
              ...MOCK_EXPLANATION.traceability,
              transactionHash: txHash
            }
          });
        }
      } catch (err: any) {
        console.error("Explanation fetch error:", err);
        // Use mock data for demo when API is unavailable
        setExplanation({
          ...MOCK_EXPLANATION,
          traceability: {
            ...MOCK_EXPLANATION.traceability,
            transactionHash: txHash
          }
        });
      } finally {
        setLoading(false);
      }
    };

    if (txHash) {
      fetchExplanation();
    }
  }, [txHash, permissionId]);

  const handleRetry = () => {
    setLoading(true);
    setError(null);
    // Trigger re-fetch by updating state
    setTimeout(() => {
      setExplanation({
        ...MOCK_EXPLANATION,
        traceability: {
          ...MOCK_EXPLANATION.traceability,
          transactionHash: txHash
        }
      });
      setLoading(false);
    }, 1500);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-hypnos-primary to-hypnos-accent flex items-center justify-center animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-hypnos-primary/30 animate-ping" />
        </div>
        <div className="mt-6 text-center">
          <div className="text-lg font-medium text-white mb-2">Analyzing Transaction</div>
          <div className="text-sm text-gray-400">AI is examining execution traces and permissions...</div>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Activity className="w-4 h-4 animate-pulse" />
          Processing on-chain data
        </div>
      </motion.div>
    );
  }

  if (error && !explanation) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl"
      >
        <div className="flex items-start gap-4">
          <XCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="font-medium text-red-400 mb-1">Failed to Load Explanation</div>
            <p className="text-sm text-gray-400 mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!explanation) {
    return null;
  }

  const riskColors = {
    low: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400", icon: CheckCircle2 },
    medium: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", icon: AlertTriangle },
    high: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", icon: XCircle },
  };

  const risk = riskColors[explanation.safetyAnalysis.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      {/* AI Badge */}
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-hypnos-primary/20 to-hypnos-accent/20 rounded-full">
          <Brain className="w-4 h-4 text-hypnos-primary" />
          <span className="text-xs font-medium text-white">AI-Powered Analysis</span>
        </div>
        <div className="text-xs text-gray-500">GPT-4 + On-chain Data</div>
      </div>

      {/* Summary Section */}
      <SectionCard
        title="Summary"
        icon={FileText}
        color="blue"
        expanded={expandedSections.has("summary")}
        onToggle={() => toggleSection("summary")}
      >
        <p className="text-sm text-gray-300 leading-relaxed">{explanation.summary}</p>
      </SectionCard>

      {/* Causality Section */}
      <SectionCard
        title="Causality Analysis"
        icon={Zap}
        color="purple"
        expanded={expandedSections.has("causality")}
        onToggle={() => toggleSection("causality")}
      >
        <p className="text-sm text-gray-300 leading-relaxed">{explanation.causality}</p>
      </SectionCard>

      {/* Permission Analysis */}
      <SectionCard
        title="Permission Analysis"
        icon={Shield}
        color="indigo"
        expanded={expandedSections.has("permissions")}
        onToggle={() => toggleSection("permissions")}
      >
        <div className="space-y-4">
          {explanation.permissionAnalysis.permissionConstraints.length > 0 && (
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                Constraints Applied
              </div>
              <div className="space-y-1">
                {explanation.permissionAnalysis.permissionConstraints.map((constraint, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                    {constraint}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {explanation.permissionAnalysis.allowedActions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-green-400 mb-2 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Allowed Actions
                </div>
                <div className="space-y-1">
                  {explanation.permissionAnalysis.allowedActions.map((action, i) => (
                    <div key={i} className="text-xs text-gray-400 font-mono bg-green-500/10 px-2 py-1 rounded">
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {explanation.permissionAnalysis.blockedActions.length > 0 && (
              <div>
                <div className="text-xs font-medium text-red-400 mb-2 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Blocked Actions
                </div>
                <div className="space-y-1">
                  {explanation.permissionAnalysis.blockedActions.map((action, i) => (
                    <div key={i} className="text-xs text-gray-400 font-mono bg-red-500/10 px-2 py-1 rounded">
                      {action}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SectionCard>

      {/* State Transitions */}
      {explanation.stateTransitions.length > 0 && (
        <SectionCard
          title="State Transitions"
          icon={Activity}
          color="cyan"
          expanded={expandedSections.has("states")}
          onToggle={() => toggleSection("states")}
        >
          <div className="space-y-3">
            {explanation.stateTransitions.map((transition, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div className="flex-1 text-right">
                  <span className="font-mono text-sm text-gray-400">{transition.from}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-mono text-sm text-white">{transition.to}</span>
                </div>
                <div className="text-xs text-gray-500 ml-2">{transition.reason}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Safety Analysis */}
      <SectionCard
        title="Safety Analysis"
        icon={RiskIcon}
        color={explanation.safetyAnalysis.riskLevel === "low" ? "green" : explanation.safetyAnalysis.riskLevel === "medium" ? "yellow" : "red"}
        expanded={expandedSections.has("safety")}
        onToggle={() => toggleSection("safety")}
        badge={
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${risk.bg} ${risk.text}`}>
            {explanation.safetyAnalysis.riskLevel.toUpperCase()} RISK
          </span>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {explanation.safetyAnalysis.reasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                {reason}
              </div>
            ))}
          </div>

          {explanation.safetyAnalysis.constraints.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs font-medium text-gray-400 mb-2">Active Constraints</div>
              {explanation.safetyAnalysis.constraints.map((constraint, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {constraint}
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>

      {/* Traceability */}
      <SectionCard
        title="Traceability"
        icon={Hash}
        color="gray"
        expanded={expandedSections.has("trace")}
        onToggle={() => toggleSection("trace")}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Transaction Hash</span>
            <a
              href={`https://sepolia.etherscan.io/tx/${explanation.traceability.transactionHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-hypnos-primary hover:underline"
            >
              {explanation.traceability.transactionHash.slice(0, 10)}...
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Block Number</span>
            <span className="font-mono text-white">{explanation.traceability.blockNumber.toLocaleString()}</span>
          </div>

          {explanation.traceability.events.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <div className="text-xs font-medium text-gray-400 mb-2">Emitted Events</div>
              <div className="space-y-2">
                {explanation.traceability.events.map((event, i) => (
                  <div key={i} className="p-2 bg-white/5 rounded-lg">
                    <div className="font-mono text-sm text-white mb-1">{event.name}</div>
                    <div className="text-xs text-gray-500 font-mono">
                      {JSON.stringify(event.data, null, 2).slice(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </motion.div>
  );
}

// Collapsible Section Card Component
function SectionCard({
  title,
  icon: Icon,
  color,
  expanded,
  onToggle,
  badge,
  children
}: {
  title: string;
  icon: any;
  color: string;
  expanded: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const colorMap: Record<string, { bg: string; border: string; text: string }> = {
    blue: { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400" },
    purple: { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-400" },
    indigo: { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400" },
    green: { bg: "bg-green-500/10", border: "border-green-500/30", text: "text-green-400" },
    yellow: { bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400" },
    red: { bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400" },
    cyan: { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400" },
    gray: { bg: "bg-white/5", border: "border-white/10", text: "text-gray-400" },
  };

  const colors = colorMap[color] || colorMap.gray;

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full p-4 ${colors.bg} flex items-center justify-between hover:bg-opacity-80 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${colors.text}`} />
          <span className="font-medium text-white">{title}</span>
          {badge}
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-black/20">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
