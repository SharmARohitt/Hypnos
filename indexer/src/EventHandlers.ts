/**
 * Envio Event Handlers for Hypnos
 * 
 * This file contains all event handlers for the HypnosExecutor and HypnosDemo contracts.
 * Each handler processes blockchain events and stores them in the indexer database.
 */

import {
  HypnosExecutor,
  HypnosDemo,
  Permission,
  Execution,
  PermissionGrantedEvent,
  PermissionRevokedEvent,
  PermissionUsedEvent,
  ExecutionRecordedEvent,
  CounterIncrementedEvent,
  MessageUpdatedEvent,
  BalanceDepositedEvent,
  BalanceWithdrawnEvent,
  StateSnapshotEvent,
} from "generated";

// ============================================
// HypnosExecutor Event Handlers
// ============================================

/**
 * Handle PermissionGranted events
 * Creates a new Permission entity and PermissionGrantedEvent record
 */
HypnosExecutor.PermissionGranted.handler(async ({ event, context }) => {
  const {
    user,
    permissionId,
    target,
    selector,
    maxValue,
    maxTokenAmount,
    tokenAddress,
    expiry,
  } = event.args;

  const id = permissionId.toString();

  // Create or update Permission entity
  const permission: Permission = {
    id,
    user: user.toLowerCase(),
    target: target.toLowerCase(),
    selector: selector,
    maxValue: maxValue,
    maxTokenAmount: maxTokenAmount,
    tokenAddress: tokenAddress.toLowerCase(),
    expiry: expiry,
    active: true,
    grantedAt: BigInt(event.block.timestamp),
    grantedAtBlock: BigInt(event.block.number),
    revokedAt: undefined,
    revokedAtBlock: undefined,
  };

  context.Permission.set(permission);

  // Create PermissionGrantedEvent record
  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const grantedEvent: PermissionGrantedEvent = {
    id: eventId,
    user: user.toLowerCase(),
    permissionId: id,
    target: target.toLowerCase(),
    selector: selector,
    maxValue: maxValue,
    maxTokenAmount: maxTokenAmount,
    tokenAddress: tokenAddress.toLowerCase(),
    expiry: expiry,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.PermissionGrantedEvent.set(grantedEvent);

  context.log.info(`Permission granted: ${id} for user ${user}`);
});

/**
 * Handle PermissionRevoked events
 * Updates the Permission entity to inactive and creates a PermissionRevokedEvent record
 */
HypnosExecutor.PermissionRevoked.handler(async ({ event, context }) => {
  const { user, permissionId } = event.args;
  const id = permissionId.toString();

  // Load existing permission
  const existingPermission = await context.Permission.get(id);

  if (existingPermission) {
    // Update permission to inactive
    const updatedPermission: Permission = {
      ...existingPermission,
      active: false,
      revokedAt: BigInt(event.block.timestamp),
      revokedAtBlock: BigInt(event.block.number),
    };

    context.Permission.set(updatedPermission);
  }

  // Create PermissionRevokedEvent record
  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const revokedEvent: PermissionRevokedEvent = {
    id: eventId,
    user: user.toLowerCase(),
    permissionId: id,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.PermissionRevokedEvent.set(revokedEvent);

  context.log.info(`Permission revoked: ${id} for user ${user}`);
});

/**
 * Handle PermissionUsed events
 * Creates a PermissionUsedEvent record to track permission usage
 */
HypnosExecutor.PermissionUsed.handler(async ({ event, context }) => {
  const { user, permissionId, executionId, target, selector, value, success } = event.args;

  // Create PermissionUsedEvent record
  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const usedEvent: PermissionUsedEvent = {
    id: eventId,
    user: user.toLowerCase(),
    permissionId: permissionId.toString(),
    executionId: executionId.toString(),
    target: target.toLowerCase(),
    selector: selector,
    value: value,
    success: success,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.PermissionUsedEvent.set(usedEvent);

  context.log.info(`Permission used: ${permissionId} for execution ${executionId}`);
});

/**
 * Handle ExecutionRecorded events
 * Creates an Execution entity linked to the permission
 */
HypnosExecutor.ExecutionRecorded.handler(async ({ event, context }) => {
  const { executionId, executor, target, selector, value, permissionId, success, reason } = event.args;

  const id = executionId.toString();

  // Create Execution entity
  const execution: Execution = {
    id,
    executor: executor.toLowerCase(),
    target: target.toLowerCase(),
    selector: selector,
    value: value,
    data: "", // Data not available in event, would need to be fetched from transaction
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
    permission_id: permissionId.toString(),
    permissionId: permissionId.toString(),
    success: success,
    reason: reason,
  };

  context.Execution.set(execution);

  context.log.info(`Execution recorded: ${id} - ${success ? "SUCCESS" : "FAILED"}: ${reason}`);
});

// ============================================
// HypnosDemo Event Handlers
// ============================================

/**
 * Handle CounterIncremented events
 */
HypnosDemo.CounterIncremented.handler(async ({ event, context }) => {
  const { caller, oldValue, newValue } = event.args;

  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const counterEvent: CounterIncrementedEvent = {
    id: eventId,
    caller: caller.toLowerCase(),
    oldValue: oldValue,
    newValue: newValue,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.CounterIncrementedEvent.set(counterEvent);

  context.log.info(`Counter incremented: ${oldValue} -> ${newValue} by ${caller}`);
});

/**
 * Handle MessageUpdated events
 */
HypnosDemo.MessageUpdated.handler(async ({ event, context }) => {
  const { caller, oldMessage, newMessage } = event.args;

  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const messageEvent: MessageUpdatedEvent = {
    id: eventId,
    caller: caller.toLowerCase(),
    oldMessage: oldMessage,
    newMessage: newMessage,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.MessageUpdatedEvent.set(messageEvent);

  context.log.info(`Message updated by ${caller}: "${oldMessage}" -> "${newMessage}"`);
});

/**
 * Handle BalanceDeposited events
 */
HypnosDemo.BalanceDeposited.handler(async ({ event, context }) => {
  const { depositor, amount, newBalance } = event.args;

  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const depositEvent: BalanceDepositedEvent = {
    id: eventId,
    depositor: depositor.toLowerCase(),
    amount: amount,
    newBalance: newBalance,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.BalanceDepositedEvent.set(depositEvent);

  context.log.info(`Deposit: ${amount} wei from ${depositor}, new balance: ${newBalance}`);
});

/**
 * Handle BalanceWithdrawn events
 */
HypnosDemo.BalanceWithdrawn.handler(async ({ event, context }) => {
  const { withdrawer, amount, newBalance } = event.args;

  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const withdrawEvent: BalanceWithdrawnEvent = {
    id: eventId,
    withdrawer: withdrawer.toLowerCase(),
    amount: amount,
    newBalance: newBalance,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.BalanceWithdrawnEvent.set(withdrawEvent);

  context.log.info(`Withdrawal: ${amount} wei by ${withdrawer}, new balance: ${newBalance}`);
});

/**
 * Handle StateSnapshot events
 */
HypnosDemo.StateSnapshot.handler(async ({ event, context }) => {
  const { caller, counter, message } = event.args;

  const eventId = `${event.transaction.hash}-${event.logIndex}`;
  const snapshotEvent: StateSnapshotEvent = {
    id: eventId,
    caller: caller.toLowerCase(),
    counter: counter,
    message: message,
    timestamp: BigInt(event.block.timestamp),
    blockNumber: BigInt(event.block.number),
    transactionHash: event.transaction.hash,
  };

  context.StateSnapshotEvent.set(snapshotEvent);

  context.log.info(`State snapshot by ${caller}: counter=${counter}, message="${message}"`);
});
