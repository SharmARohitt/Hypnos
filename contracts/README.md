# Hypnos Smart Contracts

Solidity smart contracts for the Hypnos cognitive execution layer.

## Contracts

### HypnosExecutor

Main execution contract that enforces permission-gated execution. Key features:

- Fine-grained permission management
- Permission-gated function execution
- Token transfer execution with limits
- Rich event emission for observability
- Reentrancy protection

### HypnosDemo

Demo contract showcasing observable state changes. Features:

- Counter increments
- Message updates
- ETH deposits/withdrawals
- State snapshots
- Caller tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your keys
```

3. Compile:
```bash
npm run compile
```

## Deployment

Deploy to Sepolia:
```bash
npm run deploy:sepolia
```

Save the deployed contract addresses for use in frontend and indexer configuration.

## Testing

```bash
npm test
```

## Contract Addresses

After deployment, update these in:
- `frontend/.env.local` (NEXT_PUBLIC_EXECUTOR_ADDRESS, NEXT_PUBLIC_DEMO_ADDRESS)
- `indexer/.env` (HYPNOS_EXECUTOR_ADDRESS, HYPNOS_DEMO_ADDRESS)
- `backend/.env` (HYPNOS_EXECUTOR_ADDRESS, HYPNOS_DEMO_ADDRESS)
