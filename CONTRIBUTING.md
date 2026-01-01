# Contributing to Hypnos

Thank you for your interest in contributing to Hypnos! This document provides guidelines and instructions for contributors.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Hypnos
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm install --workspaces
   ```

3. **Set up environment variables**
   - Copy `.env.example` files in each workspace
   - Configure with your API keys and RPC endpoints

4. **Start development servers**
   ```bash
   npm run dev  # Starts frontend and backend
   npm run dev:indexer  # In separate terminal for indexer
   ```

## Project Structure

```
Hypnos/
├── contracts/     # Solidity smart contracts
├── indexer/       # Envio indexer
├── backend/       # Node.js API + AI service
├── frontend/      # Next.js frontend
└── docs/          # Documentation
```

## Development Guidelines

### Smart Contracts

- Follow Solidity style guide
- Add comprehensive events for observability
- Write tests for all functions
- Document with NatSpec comments

### Backend

- Use TypeScript for type safety
- Follow REST API conventions
- Add error handling
- Document API endpoints

### Frontend

- Use TypeScript
- Follow React best practices
- Maintain component structure
- Ensure MetaMask integration is robust

### Indexer

- Update schema.gql when adding new events
- Keep handlers focused and simple
- Test with real events before deploying

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, documented code
   - Add tests where appropriate
   - Update documentation

3. **Test your changes**
   - Run tests: `npm test`
   - Test locally: `npm run dev`
   - Verify contracts compile: `cd contracts && npm run compile`

4. **Submit PR**
   - Write clear description
   - Reference any related issues
   - Ensure CI passes

## Code Style

- **TypeScript**: Use strict mode, prefer interfaces over types
- **Solidity**: Follow official style guide, use latest stable version
- **React**: Functional components, hooks, TypeScript
- **Naming**: Use descriptive names, camelCase for variables/functions

## Testing

- **Smart Contracts**: Use Hardhat, write comprehensive tests
- **Backend**: Use Jest, test API endpoints
- **Frontend**: Test user flows, MetaMask integration

## Documentation

- Update README.md for user-facing changes
- Update ARCHITECTURE.md for architectural changes
- Add code comments for complex logic
- Document API changes

## Security

- Never commit private keys or API keys
- Review permission logic carefully
- Test edge cases and error conditions
- Follow security best practices for smart contracts

## Questions?

- Open an issue for bugs or feature requests
- Check existing documentation
- Review ARCHITECTURE.md for system design

Thank you for contributing to Hypnos! 🚀
