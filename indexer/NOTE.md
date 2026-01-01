# Envio Indexer Implementation Note

The indexer implementation in this repository uses a conceptual structure based on common indexer patterns (similar to The Graph). The actual implementation may need adjustment based on:

1. **Envio SDK Version**: Different versions may have different APIs
2. **Event Handling**: The exact event parameter access patterns
3. **Schema Generation**: Code generation from schema.gql

## Implementation Steps

1. **Generate Code**: Run `npm run codegen` to generate TypeScript types from schema.gql
2. **Adjust Handlers**: Modify event handlers in `src/` to match the generated types
3. **Test**: Use `npm run dev` to test the indexer locally
4. **Deploy**: Use `npm run deploy` to deploy to Envio

## Event Handler Structure

The event handlers follow this pattern:
- Each contract has a handler file (e.g., `HypnosExecutor.ts`)
- Each event has a corresponding handler function
- Handlers create/update entities in the GraphQL schema
- Event data is extracted from event parameters

## Common Adjustments Needed

1. **Parameter Access**: The way event parameters are accessed may differ
   - May use `event.params.paramName` directly
   - Or may need to decode from topics/data

2. **Type Imports**: Generated types location may differ
   - Check `generated/` directory after codegen
   - Adjust imports accordingly

3. **Event Signatures**: Verify event signatures match contract events exactly

## Resources

- Envio Documentation: https://docs.envio.dev
- Envio Discord: For SDK-specific questions
- Contract ABIs: Ensure ABIs in `abis/` match deployed contracts
