# Hypnos Frontend

Next.js frontend for Hypnos with MetaMask Smart Accounts Kit integration.

## Features

- MetaMask wallet connection
- Advanced Permissions (ERC-7715) UI flow
- Smart Account transaction execution
- Real-time Envio indexer status
- AI-powered transaction explanations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env.local
# Edit .env.local with contract addresses and API URL
```

Required environment variables:
- `NEXT_PUBLIC_EXECUTOR_ADDRESS`: HypnosExecutor contract address
- `NEXT_PUBLIC_DEMO_ADDRESS`: HypnosDemo contract address
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:4000)
- `NEXT_PUBLIC_INDEXER_URL`: Envio GraphQL endpoint (optional)

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Usage Flow

1. **Connect MetaMask**: Connect your wallet to Sepolia testnet
2. **Grant Permission**: Grant a fine-grained permission via ERC-7715
3. **Execute Transaction**: Execute a transaction using the granted permission
4. **View Explanation**: See AI-powered explanation of the execution
5. **Monitor Events**: Watch Envio indexer status in real-time

## MetaMask Integration

The frontend uses:
- `@metamask/smart-accounts-sdk` for Smart Accounts
- MetaMask Advanced Permissions (ERC-7715) for fine-grained permissions
- Direct contract interaction for demo purposes

## Building

```bash
npm run build
npm start
```
