# Hypnos Architecture

## System Overview

Hypnos is a cognitive execution layer that provides runtime intelligence for Ethereum smart contract execution. It combines permission-gated execution, real-time event indexing, and AI-powered explanations to create a transparent and safe execution environment.

## Architecture Components

### 1. Smart Contracts Layer

**HypnosExecutor**
- Core permission management contract
- Enforces fine-grained permission checks
- Records all executions with rich event emission
- Supports both ETH and token transfers

**HypnosDemo**
- Demo contract showcasing observable state changes
- Multiple state-changing functions
- Rich event emission for observability
- Used to demonstrate Hypnos capabilities

### 2. Indexing Layer (Envio)

**Purpose**: Real-time indexing of all blockchain events

**Indexed Events**:
- `PermissionGranted`: When a permission is created
- `PermissionRevoked`: When a permission is deactivated
- `PermissionUsed`: When a permission is utilized for execution
- `ExecutionRecorded`: Detailed execution records
- Demo contract events (CounterIncremented, MessageUpdated, etc.)

**GraphQL Schema**: Provides queryable interface for all indexed data

### 3. Backend API

**Services**:
- `BlockchainService`: Interacts with Ethereum blockchain
  - Fetches transaction traces
  - Retrieves permission data
  - Parses event logs

- `AIService`: Provides intelligent explanations
  - Analyzes transaction traces
  - Considers permission context
  - Generates human-readable explanations
  - Falls back to rule-based explanations if AI unavailable

**Endpoints**:
- `POST /api/explain`: Get AI explanation for transaction
- `GET /api/transaction/:txHash`: Get transaction details
- `GET /api/permission/:executor/:permissionId`: Get permission details

### 4. Frontend Layer

**Tech Stack**:
- Next.js 14 (React)
- MetaMask Smart Accounts SDK
- TailwindCSS for styling
- TypeScript for type safety

**Components**:
- `WalletConnection`: MetaMask connection handling
- `PermissionGrant`: ERC-7715 permission grant UI
- `ExecutionPanel`: Transaction execution interface
- `ExplanationView`: AI explanation display
- `EventIndexer`: Envio indexer status

**Flow**:
1. User connects MetaMask
2. User grants Advanced Permission (ERC-7715)
3. User executes transaction via Smart Account
4. System analyzes execution and provides explanation
5. Envio indexes events in real-time

## Data Flow

```
User Action (Frontend)
    ↓
MetaMask (Permission Grant)
    ↓
Smart Account (Execution)
    ↓
HypnosExecutor Contract (Permission Check + Execution)
    ↓
┌─────────────────────┬─────────────────────┐
│                     │                     │
↓                     ↓                     ↓
Blockchain         Envio Indexer        Backend API
(Events)           (GraphQL)            (Analysis)
    │                     │                     │
    └─────────────────────┴─────────────────────┘
                          ↓
                    AI Explanation
                          ↓
                    Frontend Display
```

## Permission Model

### Permission Structure

```solidity
struct Permission {
    address target;           // Target contract
    bytes4 selector;          // Function selector (0x0 = any)
    uint256 maxValue;         // Max ETH value
    uint256 maxTokenAmount;   // Max token amount
    address tokenAddress;     // Token contract (0x0 = ETH)
    uint256 expiry;           // Expiration timestamp
    bool active;              // Active status
}
```

### Permission Lifecycle

1. **Grant**: User grants permission via MetaMask Advanced Permissions (ERC-7715)
2. **Validate**: Permission stored on-chain with constraints
3. **Execute**: Transaction checked against permission constraints
4. **Record**: Execution recorded with permission reference
5. **Revoke**: User can revoke permission at any time

## Security Considerations

### Permission Enforcement

- All executions go through `HypnosExecutor`
- Permission checks happen at contract level
- No bypass possible without permission
- Reentrancy protection via ReentrancyGuard

### AI Explanation Safety

- Explanations based on on-chain data only
- No speculative content
- Deterministic analysis when possible
- Traceable to transaction hash and block number

### Access Control

- Smart Accounts provide isolation
- No private key exposure
- Fine-grained permissions prevent over-authorization
- Time-bound permissions prevent indefinite access

## Observability

### Event Indexing

All critical events are indexed by Envio:
- Permission lifecycle events
- Execution records
- State changes
- Failure reasons

### Query Interface

GraphQL provides flexible querying:
```graphql
query {
  executions(where: { executor: "0x..." }) {
    id
    target
    success
    permission {
      maxValue
      expiry
    }
  }
}
```

### Explanation Granularity

AI explanations include:
- **Summary**: High-level what happened
- **Causality**: Why it was allowed
- **Permission Analysis**: What was allowed/blocked
- **State Transitions**: How state changed
- **Safety Analysis**: Risk assessment
- **Traceability**: Links to on-chain data

## Scalability Considerations

### Current MVP

- Single permission per execution
- Direct contract calls
- Synchronous indexing
- Single AI explanation provider

### Future Enhancements

- Batch executions
- Multi-permission composition
- Async indexing with queue
- Multiple AI providers with consensus
- Caching layer for explanations
- Permission templates
- Delegation chains

## Integration Points

### MetaMask Smart Accounts Kit

- Uses `@metamask/smart-accounts-sdk`
- Supports Advanced Permissions (ERC-7715)
- Works with EIP-7702 compatible chains
- Sepolia testnet for MVP

### Envio Indexer

- GraphQL endpoint for queries
- Real-time event processing
- Historical data indexing
- Subgraph-like interface

### AI Services

- OpenAI GPT-4 for explanations (optional)
- Rule-based fallback always available
- Extensible to other AI providers
- Deterministic when possible

## Testing Strategy

### Unit Tests

- Contract function tests
- Permission validation tests
- Execution constraint tests

### Integration Tests

- Full flow from permission grant to execution
- Event indexing verification
- Explanation accuracy checks

### End-to-End Tests

- MetaMask integration
- Full user journey
- Error handling

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│           Frontend (Vercel)             │
│         Next.js Application             │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Backend API (Railway/VPS)       │
│      Express + AI Service               │
└─────────────────┬───────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼──────┐   ┌────────▼────────┐
│   Envio      │   │  Ethereum RPC   │
│   Indexer    │   │  (Infura/Alchemy)│
└───────┬──────┘   └────────┬────────┘
        │                   │
        └─────────┬─────────┘
                  │
        ┌─────────▼─────────┐
        │  Ethereum Sepolia │
        │  Smart Contracts  │
        └───────────────────┘
```

## Future Roadmap

1. **Multi-chain Support**: Extend to other EVM chains
2. **Permission Templates**: Reusable permission configurations
3. **Batch Operations**: Execute multiple operations in one transaction
4. **Advanced AI**: Multi-model consensus for explanations
5. **Analytics Dashboard**: Permission usage analytics
6. **Mobile Support**: React Native integration
7. **SDK**: Developer SDK for easy integration
8. **Governance**: DAO for permission templates and policies
