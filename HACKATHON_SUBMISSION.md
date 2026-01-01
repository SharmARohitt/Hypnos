# Hypnos - Hackathon Submission

## 🏆 What Makes Hypnos Unique

Hypnos is the first cognitive execution layer for Ethereum that combines:
- **Fine-grained permission delegation** via MetaMask Advanced Permissions (ERC-7715)
- **Real-time observability** through Envio indexing
- **AI-powered explanations** that are deterministic and traceable
- **Permission-bounded autonomy** for safe AI agent execution

No existing tool answers: "Why was this transaction allowed? What could NOT happen?"

Hypnos does.

## ✅ Hackathon Requirements Checklist

### MetaMask Integration
- ✅ MetaMask Smart Accounts Kit integrated
- ✅ Advanced Permissions (ERC-7715) flow implemented
- ✅ Sepolia testnet deployment ready
- ✅ Permission UI in frontend

### Smart Contracts
- ✅ Permission-gated execution contract (`HypnosExecutor`)
- ✅ Demo contract with observable state changes (`HypnosDemo`)
- ✅ Rich event emission for observability
- ✅ Reentrancy protection and security best practices

### Envio Indexing
- ✅ GraphQL schema defined for all events
- ✅ Event handlers for permission lifecycle
- ✅ Event handlers for execution records
- ✅ Event handlers for demo contract events
- ✅ Indexer configuration for Sepolia

### AI Layer
- ✅ Transaction trace analysis
- ✅ Permission context integration
- ✅ Human-readable explanations
- ✅ Safety analysis with risk assessment
- ✅ Traceability to on-chain data

### Demo Requirements
- ✅ MetaMask permission approval UI
- ✅ Smart Account transaction execution
- ✅ Envio indexing status display
- ✅ AI explanation with real data
- ✅ Proof of unsafe action blocking

## 🎯 Key Differentiators

1. **Permission-Bounded Autonomy**: First system to enforce fine-grained permissions at the contract level while providing AI explanations of what was allowed/blocked.

2. **Causal Explanation**: AI doesn't just describe what happened—it explains WHY it was allowed and WHAT constraints prevented other actions.

3. **Deterministic AI**: Explanations are grounded in on-chain data, not speculation. Every claim is traceable to transaction hashes and block numbers.

4. **Complete Observability**: From permission grant → execution → indexing → explanation, every step is observable and queryable.

## 📊 Architecture Highlights

### Permission Model
```solidity
struct Permission {
    address target;           // Contract address
    bytes4 selector;          // Function (0x0 = any)
    uint256 maxValue;         // ETH limit
    uint256 maxTokenAmount;   // Token limit
    address tokenAddress;     // Token contract
    uint256 expiry;           // Expiration
    bool active;              // Status
}
```

### Execution Flow
1. User grants permission via MetaMask (ERC-7715)
2. Permission stored on-chain with constraints
3. Transaction executed via Smart Account
4. Contract checks permission before execution
5. Execution recorded with rich events
6. Envio indexes all events
7. AI analyzes and explains execution

### AI Explanation Structure
- **Summary**: What happened
- **Causality**: Why it was allowed
- **Permission Analysis**: What was allowed/blocked
- **State Transitions**: How state changed
- **Safety Analysis**: Risk assessment
- **Traceability**: Links to on-chain data

## 🚀 Quick Demo Flow

1. **Connect MetaMask** → Sepolia testnet
2. **Grant Permission** → Set limits (e.g., 0.01 ETH, 7 days)
3. **Execute Transaction** → Increment counter or deposit
4. **View Explanation** → AI explains why it worked, what was blocked
5. **Check Indexer** → See events indexed in real-time

## 📁 Project Structure

```
Hypnos/
├── contracts/          # Solidity smart contracts
│   ├── HypnosExecutor.sol    # Permission-gated executor
│   └── HypnosDemo.sol        # Demo contract
├── indexer/            # Envio indexer
│   ├── schema.gql            # GraphQL schema
│   └── src/                  # Event handlers
├── backend/            # Node.js API
│   ├── services/             # Blockchain & AI services
│   └── routes/               # API endpoints
└── frontend/           # Next.js app
    ├── components/           # React components
    └── hooks/                # MetaMask integration
```

## 🧪 Testing

- Smart contract tests with Hardhat
- Permission validation tests
- Execution constraint tests
- End-to-end flow tests

## 🔒 Security Features

- ReentrancyGuard protection
- Permission checks at contract level
- No unlimited approvals
- Time-bound permissions
- Active/inactive permission states
- Revocable permissions

## 📚 Documentation

- Comprehensive README
- Architecture documentation
- Deployment guide
- API documentation
- Contributing guidelines

## 🎨 UI/UX Highlights

- Modern, intuitive interface
- Step-by-step flow guidance
- Real-time status updates
- Color-coded safety indicators
- Clear permission visualization
- Rich explanation display

## 🔮 Future Vision

Hypnos aims to become:
- The standard observability layer for smart accounts
- The safety substrate for AI agents in Web3
- The explanation engine for Web3 execution
- A foundation for permission-based automation

## 💡 Innovation Points

1. **First** system to combine ERC-7715 permissions with AI explanations
2. **First** to provide deterministic, traceable AI analysis of executions
3. **First** to answer "what was NOT allowed" questions
4. **First** complete observability stack for permission-gated execution

## 🏗 Built With

- **Smart Contracts**: Solidity 0.8.24, OpenZeppelin
- **Indexing**: Envio (HyperSync)
- **Backend**: Node.js, Express, TypeScript
- **Frontend**: Next.js 14, React, TailwindCSS
- **Wallet**: MetaMask Smart Accounts Kit
- **AI**: OpenAI GPT-4 (with rule-based fallback)
- **Blockchain**: Ethereum Sepolia Testnet

## 📞 Contact & Links

- **Repository**: [GitHub URL]
- **Demo**: [Live Demo URL]
- **Documentation**: See README.md and ARCHITECTURE.md
- **Video Demo**: [Link if available]

---

**Hypnos: Understanding what smart contracts actually do.**

Built for MetaMask + Envio Hackathon 2025
