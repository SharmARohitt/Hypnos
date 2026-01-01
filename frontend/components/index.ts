// Export all components from a single entry point
// Use the new SDK-integrated versions

export { WalletConnection } from './WalletConnectionNew';
export { PermissionGrant } from './PermissionGrantNew';
export { ExecutionPanel } from './ExecutionPanelNew';
export { ExplanationView } from './ExplanationView';
export { EventIndexer } from './EventIndexer';

// Legacy exports (for backward compatibility during transition)
export { WalletConnection as WalletConnectionLegacy } from './WalletConnection';
export { PermissionGrant as PermissionGrantLegacy } from './PermissionGrant';
export { ExecutionPanel as ExecutionPanelLegacy } from './ExecutionPanel';
