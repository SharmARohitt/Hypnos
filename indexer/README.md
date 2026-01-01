# Hypnos Indexer

Envio indexer for Hypnos cognitive execution layer - real-time event indexing with GraphQL API.

## Features

- **Real-time Event Indexing**: Indexes all HypnosExecutor and HypnosDemo contract events
- **Permission Tracking**: Full lifecycle tracking of ERC-7715 style permissions
- **Execution History**: Complete execution records with permission context
- **GraphQL API**: Flexible querying for frontend and backend integration

## Setup

### Prerequisites

- Node.js >= 18.0.0
- Docker (for local development)
- Envio CLI (`npm install -g envio`)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
HYPNOS_EXECUTOR_ADDRESS=0x... # From deployment
HYPNOS_DEMO_ADDRESS=0x... # From deployment
```

3. Generate types (after contracts are deployed):
```bash
npm run codegen
```

4. Build the indexer:
```bash
npm run build
```

## Development

### Local Development

Start the local indexer with Docker:
```bash
npm run dev
```

This will:
- Start a local PostgreSQL database
- Start the indexer process
- Expose GraphQL at `http://localhost:8080/graphql`

### Check Logs

```bash
docker logs -f hypnos-indexer
```

### Stop Local Development

```bash
npm run stop
```

## Deployment

Deploy to Envio hosted service:
```bash
npm run deploy
```

This will provide a GraphQL endpoint like:
```
https://indexer.bigdevenergy.link/YOUR_INDEXER/v1/graphql
```

## GraphQL API

### Example Queries

**Get all permissions for a user:**
```graphql
query GetUserPermissions($user: String!) {
  permissions(where: { user: $user, active: true }) {
    id
    target
    selector
    maxValue
    expiry
    grantedAt
    executions {
      id
      success
      transactionHash
    }
  }
}
```

**Get execution history:**
```graphql
query GetExecutions($executor: String!) {
  executions(
    where: { executor: $executor }
    orderBy: timestamp
    orderDirection: desc
    first: 10
  ) {
    id
    target
    value
    success
    reason
    transactionHash
    permission {
      id
      maxValue
      expiry
    }
  }
}
```

**Get recent events:**
```graphql
query GetRecentEvents {
  permissionGrantedEvents(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    user
    permissionId
    target
    maxValue
    expiry
    transactionHash
  }
  counterIncrementedEvents(orderBy: timestamp, orderDirection: desc, first: 10) {
    id
    caller
    oldValue
    newValue
    transactionHash
  }
}
```

## Indexed Entities

### Permission Management
- `Permission`: Active permissions with full details
- `PermissionGrantedEvent`: Permission creation events
- `PermissionRevokedEvent`: Permission revocation events
- `PermissionUsedEvent`: Permission usage tracking

### Execution Tracking
- `Execution`: Full execution records linked to permissions

### Demo Contract Events
- `CounterIncrementedEvent`: Counter changes
- `MessageUpdatedEvent`: Message updates
- `BalanceDepositedEvent`: Deposits
- `BalanceWithdrawnEvent`: Withdrawals
- `StateSnapshotEvent`: State snapshots

## File Structure

```
indexer/
├── config.yaml           # Envio configuration
├── schema.graphql        # GraphQL schema
├── src/
│   └── EventHandlers.ts  # Event handler logic
├── generated/            # Generated types (after codegen)
├── .env.example         # Environment template
└── package.json
```

## Notes

- The `generated/` directory is created by `envio codegen` and should not be committed
- Make sure contracts are deployed before running `codegen`
- For production, use a reliable RPC provider (Infura, Alchemy, etc.)
- The indexer will sync from the start block specified in config

## Troubleshooting

### "Cannot find module 'generated'"
Run `npm run codegen` first. The generated types are created based on your schema and config.

### Events not indexing
1. Verify contract addresses in `.env`
2. Check start block is before contract deployment
3. Ensure RPC URL is valid and accessible

### GraphQL errors
Run `npm run codegen` after any schema changes.
