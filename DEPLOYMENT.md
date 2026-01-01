# Hypnos Deployment Guide

Complete deployment guide for Hypnos on Ethereum Sepolia testnet.

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- MetaMask browser extension
- Sepolia testnet ETH
- Infura/Alchemy API key (or other RPC provider)
- OpenAI API key (optional, for AI explanations)

## Step 1: Deploy Smart Contracts

```bash
cd contracts
npm install

# Configure .env
cp .env.example .env
# Edit .env with your:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY (deployer wallet)
# - ETHERSCAN_API_KEY (optional, for verification)

# Compile
npm run compile

# Deploy
npm run deploy:sepolia
```

**Save the deployed contract addresses!**

## Step 2: Setup Envio Indexer

```bash
cd indexer
npm install

# Configure .env
cp .env.example .env
# Edit .env with:
# - SEPOLIA_RPC_URL
# - HYPNOS_EXECUTOR_ADDRESS (from step 1)
# - HYPNOS_DEMO_ADDRESS (from step 1)
# - HYPNOS_EXECUTOR_START_BLOCK (block number where executor was deployed)
# - HYPNOS_DEMO_START_BLOCK (block number where demo was deployed)

# Copy contract ABIs
# From contracts/artifacts/contracts/*.sol/*.json to indexer/abis/

# Generate code
npm run codegen

# Build
npm run build

# Deploy indexer
npm run deploy
```

**Save the GraphQL endpoint URL!**

## Step 3: Setup Backend

```bash
cd backend
npm install

# Configure .env
cp .env.example .env
# Edit .env with:
# - PORT (default: 4000)
# - SEPOLIA_RPC_URL
# - HYPNOS_EXECUTOR_ADDRESS
# - HYPNOS_DEMO_ADDRESS
# - OPENAI_API_KEY (optional)

# Run
npm run dev
```

Backend will be available at `http://localhost:4000`

## Step 4: Setup Frontend

```bash
cd frontend
npm install

# Configure .env.local
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_EXECUTOR_ADDRESS
# - NEXT_PUBLIC_DEMO_ADDRESS
# - NEXT_PUBLIC_API_URL (backend URL)
# - NEXT_PUBLIC_INDEXER_URL (Envio GraphQL endpoint)

# Run
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Step 5: Testing the Full Flow

1. **Connect MetaMask**
   - Ensure you're on Sepolia testnet (Chain ID: 11155111)
   - Connect your wallet

2. **Grant Permission**
   - Enter the demo contract address
   - Set max value (e.g., 0.01 ETH)
   - Set expiry (e.g., 7 days)
   - Click "Grant Permission"
   - Approve in MetaMask

3. **Execute Transaction**
   - Select an action (increment counter or deposit)
   - Click "Execute Transaction"
   - Approve in MetaMask
   - Wait for confirmation

4. **View Explanation**
   - AI explanation will appear automatically
   - Review causality, permissions, and safety analysis

5. **Check Indexer**
   - Verify Envio indexer is tracking events
   - Events should appear in the indexer status

## Verification Checklist

- ✅ Contracts deployed on Sepolia
- ✅ Contract addresses configured in all services
- ✅ Envio indexer running and indexing events
- ✅ Backend API responding at /health
- ✅ Frontend connecting to MetaMask
- ✅ Permission grant flow working
- ✅ Transaction execution successful
- ✅ AI explanation displaying
- ✅ Events indexed in Envio

## Troubleshooting

### MetaMask Connection Issues
- Ensure MetaMask is unlocked
- Check you're on Sepolia testnet
- Verify contract addresses are correct

### Transaction Failures
- Check you have Sepolia ETH for gas
- Verify permission was granted correctly
- Check contract addresses match deployment

### Indexer Not Working
- Verify RPC URL is correct
- Check contract addresses in indexer config
- Ensure start blocks are correct
- Check Envio deployment status

### AI Explanations Not Loading
- Verify backend is running
- Check OPENAI_API_KEY if using AI (otherwise uses fallback)
- Verify transaction hash is correct

## Production Considerations

For production deployment:

1. **Security**
   - Audit smart contracts
   - Use multi-sig for admin functions
   - Implement rate limiting on API
   - Secure API keys

2. **Infrastructure**
   - Use production RPC endpoints
   - Set up monitoring and alerts
   - Configure proper CORS
   - Use HTTPS for all services

3. **Scalability**
   - Consider caching for indexer queries
   - Implement request throttling
   - Use CDN for frontend
   - Consider database for explanation caching

4. **MetaMask Advanced Permissions**
   - Implement full ERC-7715 flow
   - Use proper permission request UI
   - Handle permission expiry gracefully
   - Implement permission revocation UI
