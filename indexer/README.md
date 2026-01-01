# Hypnos Indexer

Envio indexer for Hypnos events and state tracking.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Generate ABIs from contracts:
```bash
# Copy compiled contract ABIs from contracts/artifacts to indexer/abis/
```

4. Build and deploy:
```bash
npm run codegen
npm run build
npm run deploy
```

## Environment Variables

- `SEPOLIA_RPC_URL`: Sepolia RPC endpoint
- `HYPNOS_EXECUTOR_ADDRESS`: Deployed HypnosExecutor contract address
- `HYPNOS_DEMO_ADDRESS`: Deployed HypnosDemo contract address
- `HYPNOS_EXECUTOR_START_BLOCK`: Start block for HypnosExecutor (optional)
- `HYPNOS_DEMO_START_BLOCK`: Start block for HypnosDemo (optional)

## GraphQL Queries

Once deployed, query the indexer at the provided GraphQL endpoint.

Example queries:

```graphql
# Get all permissions for a user
query GetUserPermissions($user: String!) {
  permissions(where: { user: $user }) {
    id
    target
    selector
    maxValue
    expiry
    active
  }
}

# Get execution history
query GetExecutions($executor: String!) {
  executions(where: { executor: $executor }, orderBy: timestamp, orderDirection: desc) {
    id
    target
    selector
    value
    success
    reason
    permission {
      id
      maxValue
    }
  }
}
```
