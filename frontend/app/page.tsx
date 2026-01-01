"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MetaMaskProvider } from "@/hooks/useMetaMask";
import { WalletConnection } from "@/components/WalletConnection";
import { PermissionGrant } from "@/components/PermissionGrant";
import { ExecutionPanel } from "@/components/ExecutionPanel";
import { ExplanationView } from "@/components/ExplanationView";
import { EventIndexer } from "@/components/EventIndexer";
import { 
  Brain, 
  Shield, 
  Zap, 
  Eye, 
  Lock, 
  ArrowRight, 
  CheckCircle2,
  Github,
  ExternalLink,
  ChevronDown
} from "lucide-react";

type Step = "connect" | "permission" | "execute" | "explain";

const steps = [
  { id: "connect", label: "Connect Wallet", icon: Lock },
  { id: "permission", label: "Grant Permission", icon: Shield },
  { id: "execute", label: "Execute Transaction", icon: Zap },
  { id: "explain", label: "View Explanation", icon: Brain },
];

export default function Home() {
  const [currentStep, setCurrentStep] = useState<Step>("connect");
  const [permissionId, setPermissionId] = useState<string | null>(null);
  const [executionTxHash, setExecutionTxHash] = useState<string | null>(null);

  const getStepIndex = (step: Step) => steps.findIndex(s => s.id === step);
  const currentStepIndex = getStepIndex(currentStep);

  return (
    <MetaMaskProvider>
      <main className="min-h-screen text-white">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hypnos-primary to-hypnos-accent flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-gradient">Hypnos</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
                <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
                <a href="#demo" className="text-gray-400 hover:text-white transition-colors text-sm">Demo</a>
                <a 
                  href="https://github.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-gray-300">Built for ERC-7715 Advanced Permissions</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gradient">Cognitive Execution</span>
                <br />
                <span className="text-white">Layer for Ethereum</span>
              </h1>
              
              <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-8 leading-relaxed">
                Hypnos bridges human intent, AI reasoning, and deterministic blockchain execution. 
                Understand what smart contracts <span className="text-white font-medium">actually do</span>, 
                observe <span className="text-white font-medium">real execution</span>, and safely 
                <span className="text-white font-medium"> delegate actions</span>.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
                <a href="#demo" className="btn-primary flex items-center gap-2">
                  Try Demo <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#how-it-works" className="btn-secondary flex items-center gap-2">
                  Learn More <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div 
              className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {[
                { icon: Eye, title: "Observe", desc: "Real-time contract execution monitoring" },
                { icon: Brain, title: "Explain", desc: "AI-powered causal explanations" },
                { icon: Shield, title: "Protect", desc: "Permission-bounded autonomy" },
                { icon: Zap, title: "Execute", desc: "Safe delegated transactions" },
              ].map((feature, i) => (
                <div key={i} className="glass rounded-2xl p-6 card-hover">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hypnos-primary/20 to-hypnos-accent/20 flex items-center justify-center mb-4 mx-auto">
                    <feature.icon className="w-6 h-6 text-hypnos-primary" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Core Philosophy Section */}
        <section id="features" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Philosophy</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Built on fundamental beliefs about how AI and blockchain should interact
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[
                { 
                  title: "Smart contracts don't \"run\" — they react", 
                  desc: "Understanding the reactive nature of blockchain execution is key to building safe systems.",
                  color: "from-blue-500/20 to-cyan-500/20"
                },
                { 
                  title: "AI cannot be trusted with ownership", 
                  desc: "AI should have capabilities, not ownership. Permissions are granted, not keys.",
                  color: "from-purple-500/20 to-pink-500/20"
                },
                { 
                  title: "Observability without meaning is useless", 
                  desc: "Events and logs alone don't tell you what happened. Explanations do.",
                  color: "from-orange-500/20 to-yellow-500/20"
                },
                { 
                  title: "Execution without understanding is dangerous", 
                  desc: "Every transaction should be explainable before and after execution.",
                  color: "from-green-500/20 to-emerald-500/20"
                },
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  className={`glass rounded-2xl p-6 card-hover border-l-4 border-l-hypnos-primary`}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <h3 className="font-semibold text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 px-6 bg-black/20">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How Hypnos Works</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                A complete cognitive pipeline from user intent to explained execution
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    step: 1,
                    title: "Permission Grant",
                    desc: "Grant fine-grained permissions via MetaMask Advanced Permissions (ERC-7715). Define exactly what actions are allowed.",
                    icon: Shield,
                    details: ["Target contract", "Function selector", "Max ETH value", "Expiration time"]
                  },
                  {
                    step: 2,
                    title: "Execution & Indexing",
                    desc: "Execute transactions through Smart Accounts. Envio indexes all events in real-time for observability.",
                    icon: Zap,
                    details: ["Permission validation", "State transition", "Event emission", "Real-time indexing"]
                  },
                  {
                    step: 3,
                    title: "AI Explanation",
                    desc: "AI analyzes execution traces and explains causality, permissions used, and safety implications.",
                    icon: Brain,
                    details: ["Causal analysis", "Permission context", "State changes", "Risk assessment"]
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="relative"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="glass rounded-2xl p-6 h-full">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hypnos-primary to-hypnos-secondary flex items-center justify-center text-white font-bold">
                          {item.step}
                        </div>
                        <item.icon className="w-6 h-6 text-hypnos-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{item.desc}</p>
                      <ul className="space-y-2">
                        {item.details.map((detail, j) => (
                          <li key={j} className="flex items-center gap-2 text-sm text-gray-500">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {i < 2 && (
                      <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ArrowRight className="w-8 h-8 text-hypnos-primary/30" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo" className="py-20 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Demo</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Experience Hypnos in action. Connect your wallet, grant permissions, and see AI explanations.
              </p>
            </div>

            {/* Progress Steps */}
            <div className="max-w-3xl mx-auto mb-12">
              <div className="flex items-center justify-between">
                {steps.map((step, i) => {
                  const StepIcon = step.icon;
                  const isCompleted = i < currentStepIndex;
                  const isCurrent = i === currentStepIndex;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                          ${isCompleted ? 'bg-green-500 text-white' : 
                            isCurrent ? 'bg-gradient-to-br from-hypnos-primary to-hypnos-secondary text-white glow' : 
                            'bg-white/10 text-gray-500'}
                        `}>
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : (
                            <StepIcon className="w-5 h-5" />
                          )}
                        </div>
                        <span className={`mt-2 text-xs font-medium ${isCurrent ? 'text-white' : 'text-gray-500'}`}>
                          {step.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`w-16 md:w-24 h-0.5 mx-2 ${i < currentStepIndex ? 'bg-green-500' : 'bg-white/10'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Main Demo Content */}
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Left Column - Actions */}
              <div className="lg:col-span-3 space-y-6">
                <AnimatePresence mode="wait">
                  {/* Step 1: Connect Wallet */}
                  <motion.div
                    key="connect"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">Step 1: Connect MetaMask</h3>
                        <p className="text-sm text-gray-400">Connect your wallet to Sepolia testnet</p>
                      </div>
                    </div>
                    <WalletConnection onConnected={() => setCurrentStep("permission")} />
                  </motion.div>

                  {/* Step 2: Grant Permission */}
                  {currentStepIndex >= 1 && (
                    <motion.div
                      key="permission"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Step 2: Grant Permission (ERC-7715)</h3>
                          <p className="text-sm text-gray-400">Define fine-grained execution capabilities</p>
                        </div>
                      </div>
                      <PermissionGrant
                        onPermissionGranted={(pid) => {
                          setPermissionId(pid);
                          setCurrentStep("execute");
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Step 3: Execute Transaction */}
                  {currentStepIndex >= 2 && permissionId && (
                    <motion.div
                      key="execute"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                          <Zap className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Step 3: Execute Transaction</h3>
                          <p className="text-sm text-gray-400">Execute using your granted permission</p>
                        </div>
                      </div>
                      <ExecutionPanel
                        permissionId={permissionId}
                        onExecutionComplete={(txHash) => {
                          setExecutionTxHash(txHash);
                          setCurrentStep("explain");
                        }}
                      />
                    </motion.div>
                  )}

                  {/* Step 4: AI Explanation */}
                  {executionTxHash && (
                    <motion.div
                      key="explain"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold">Step 4: AI Explanation</h3>
                          <p className="text-sm text-gray-400">Understanding what happened and why</p>
                        </div>
                      </div>
                      <ExplanationView txHash={executionTxHash} permissionId={permissionId || undefined} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Column - Observability */}
              <div className="lg:col-span-2 space-y-6">
                {/* Envio Indexer */}
                <div className="glass rounded-2xl p-6 glow-green">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Envio Indexer</h3>
                      <p className="text-xs text-gray-400">Real-time event indexing</p>
                    </div>
                  </div>
                  <EventIndexer />
                </div>

                {/* Architecture Info */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Architecture</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Frontend</span>
                      <span className="badge badge-info">Next.js 14 + React</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Smart Contracts</span>
                      <span className="badge badge-purple">Solidity + Hardhat</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Indexer</span>
                      <span className="badge badge-success">Envio</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">AI Engine</span>
                      <span className="badge badge-warning">GPT-4 + Custom</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-400">Network</span>
                      <span className="badge badge-info">Sepolia Testnet</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">Resources</h3>
                  <div className="space-y-2">
                    {[
                      { label: "View Contract on Etherscan", href: "https://sepolia.etherscan.io" },
                      { label: "ERC-7715 Specification", href: "https://eips.ethereum.org/EIPS/eip-7715" },
                      { label: "MetaMask Documentation", href: "https://docs.metamask.io" },
                      { label: "Envio Documentation", href: "https://docs.envio.dev" },
                    ].map((link, i) => (
                      <a
                        key={i}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
                      >
                        <span className="text-sm text-gray-300">{link.label}</span>
                        <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/5">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hypnos-primary to-hypnos-accent flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gradient">Hypnos</span>
              </div>
              <p className="text-sm text-gray-500">
                Built for hackathon demonstration • Cognitive Execution Layer for Ethereum
              </p>
              <div className="flex items-center gap-4">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </MetaMaskProvider>
  );
}
