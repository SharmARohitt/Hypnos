# Hypnos 🧠

> A cognitive execution layer for Ethereum smart contracts that bridges human intent, AI reasoning, and deterministic blockchain execution.

## 🧬 Core Philosophy

Hypnos is built on the belief that:
- Smart contracts do not "run" — they react
- AI cannot be trusted with ownership, only capabilities
- Observability without meaning is useless
- Execution without understanding is dangerous

## 🎯 What Hypnos Is

Hypnos is a runtime intelligence layer that:
- **Observes** smart contract execution in real-time
- **Explains** what happened, why it was allowed, and what could not happen
- **Tracks** permission-bounded autonomy using MetaMask Advanced Permissions (ERC-7715)
- **Analyzes** causality, state transitions, and consequences
- **Prevents** unsafe autonomy by design

## 🏗 Architecture

```
┌─────────────────┐
│   Frontend      │  React + MetaMask Smart Accounts Kit
│   (React/Next)  │  Advanced Permissions (ERC-7715)
└────────┬────────┘
         │
┌────────▼────────┐
│   Backend API   │  Express + AI Explanation Service
│   (Node.js)     │  Transaction Analysis Engine
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Envio │ │ Ethereum│
│Indexer│ │ Sepolia │
└───┬───┘ └──┬──────┘
    │        │
┌───▼────────▼───┐
│ Smart Contracts│  Permission-gated execution
│   (Solidity)   │  Rich event emission
└────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension
- Ethereum Sepolia testnet access

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Hypnos

# Install dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

### Environment Setup

1. Copy environment files:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp indexer/.env.example indexer/.env
```

2. Configure your environment variables (see each workspace's README)

### Development

```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend    # Frontend on http://localhost:3000
npm run dev:backend     # Backend API on http://localhost:4000
npm run dev:indexer     # Envio indexer
```

### Deployment

```bash
# Deploy smart contracts to Sepolia
npm run deploy

# Build all packages
npm run build
```

## 🔐 Key Features

### 1. Advanced Permissions (ERC-7715)
- Fine-grained permission grants via MetaMask
- Spending limits, time bounds, scope restrictions
- No unlimited approvals, no private key exposure

### 2. Smart Account Execution
- All transactions execute via Smart Accounts
- Permission-checked logic at contract level
- Rich event emission for observability

### 3. Envio Indexing
- Real-time event indexing
- GraphQL API for querying execution history
- Permission lifecycle tracking

### 4. AI-Powered Explanations
- Transaction trace analysis
- Permission boundary reasoning
- State diff interpretation
- Human-readable causal explanations

## 📦 Project Structure

```
Hypnos/
├── contracts/          # Solidity smart contracts
├── indexer/           # Envio indexer configuration
├── backend/           # Node.js API + AI service
├── frontend/          # React/Next.js frontend
└── package.json       # Root workspace configuration
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Test smart contracts
npm run test:contracts
```

## 📚 Documentation

- [Smart Contracts](./contracts/README.md)
- [Indexer](./indexer/README.md)
- [Backend API](./backend/README.md)
- [Frontend](./frontend/README.md)

## 🏆 Hackathon Requirements

✅ MetaMask Smart Accounts Kit  
✅ Advanced Permissions (ERC-7715)  
✅ Envio (HyperSync) Indexing  
✅ Smart Contract with Permission-gated Functions  
✅ AI Explanation Layer  
✅ Ethereum Sepolia Testnet  

## 🛡 Security

- No black-box AI decisions
- No unlimited permissions
- All actions are auditable
- Permission boundaries enforced at contract level

## 📄 License

MIT

## 🤝 Contributing

This is a hackathon project. Contributions welcome!

---

Built with ❤️ for the MetaMask + Envio Hackathon
