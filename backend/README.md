# Hypnos Backend

Backend API service for Hypnos with AI-powered transaction explanation.

## Features

- Transaction trace analysis
- Permission data fetching
- AI-powered execution explanations
- Event parsing and interpretation

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

3. Run development server:
```bash
npm run dev
```

## API Endpoints

### POST /api/explain
Get AI explanation for a transaction.

Request:
```json
{
  "txHash": "0x...",
  "executorAddress": "0x...", // optional
  "permissionId": "0x...", // optional
  "executionId": "0x..." // optional
}
```

Response:
```json
{
  "success": true,
  "data": {
    "summary": "...",
    "causality": "...",
    "permissionAnalysis": {...},
    "stateTransitions": [...],
    "safetyAnalysis": {...},
    "traceability": {...}
  }
}
```

### GET /api/transaction/:txHash
Get transaction trace and parsed events.

### GET /api/permission/:executorAddress/:permissionId
Get permission details.
