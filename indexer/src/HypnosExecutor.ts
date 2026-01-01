// Note: This uses a simplified event handler structure
// Actual Envio implementation may vary based on SDK version
// These handlers process events emitted by HypnosExecutor contract

import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import {
  Permission,
  PermissionGrantedEvent,
  PermissionRevokedEvent,
  PermissionUsedEvent,
  Execution,
} from "../generated/schema";

// Event handler for PermissionGranted event
// Signature: PermissionGranted(address indexed user, bytes32 indexed permissionId, ...)
export function handlePermissionGranted(event: ethereum.Event): void {
  // Parse event parameters
  // Note: Actual parameter access depends on Envio SDK structure
  // This is a conceptual implementation
  const permissionId = event.parameters[1].value.toBytes().toHexString();
  const user = event.parameters[0].value.toAddress().toHexString();
  
  // Create Permission entity
  let permission = new Permission(permissionId);
  permission.user = user;
  // Extract other parameters from event (structure depends on SDK)
  permission.active = true;
  permission.grantedAt = event.block.timestamp;
  permission.grantedAtBlock = event.block.number;
  permission.save();

  // Create PermissionGrantedEvent entity
  let eventEntity = new PermissionGrantedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.user = user;
  eventEntity.permissionId = permissionId;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handlePermissionRevoked(event: ethereum.Event): void {
  const permissionId = event.parameters[1].value.toBytes().toHexString();
  const user = event.parameters[0].value.toAddress().toHexString();
  
  // Update Permission entity
  let permission = Permission.load(permissionId);
  if (permission != null) {
    permission.active = false;
    permission.revokedAt = event.block.timestamp;
    permission.revokedAtBlock = event.block.number;
    permission.save();
  }

  // Create PermissionRevokedEvent entity
  let eventEntity = new PermissionRevokedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.user = user;
  eventEntity.permissionId = permissionId;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handlePermissionUsed(event: ethereum.Event): void {
  const user = event.parameters[0].value.toAddress().toHexString();
  const permissionId = event.parameters[1].value.toBytes().toHexString();
  const executionId = event.parameters[2].value.toBytes().toHexString();
  
  // Create PermissionUsedEvent entity
  let eventEntity = new PermissionUsedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.user = user;
  eventEntity.permissionId = permissionId;
  eventEntity.executionId = executionId;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handleExecutionRecorded(event: ethereum.Event): void {
  const executionId = event.parameters[0].value.toBytes().toHexString();
  const executor = event.parameters[1].value.toAddress().toHexString();
  const permissionId = event.parameters[5].value.toBytes().toHexString();
  
  // Load permission to establish relationship
  let permission = Permission.load(permissionId);
  if (permission == null) {
    // Permission might not exist if this is from a different contract
    return;
  }

  // Create Execution entity
  let execution = new Execution(executionId);
  execution.executor = executor;
  execution.permission = permission.id;
  execution.permissionId = permissionId;
  execution.timestamp = event.block.timestamp;
  execution.blockNumber = event.block.number;
  execution.transactionHash = event.transaction.hash.toHexString();
  execution.save();
}
