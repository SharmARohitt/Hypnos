import { ethereum } from "@graphprotocol/graph-ts";
import {
  CounterIncrementedEvent,
  MessageUpdatedEvent,
  BalanceDepositedEvent,
  BalanceWithdrawnEvent,
  StateSnapshotEvent,
} from "../generated/schema";

export function handleCounterIncremented(event: ethereum.Event): void {
  const caller = event.parameters[0].value.toAddress().toHexString();
  
  let eventEntity = new CounterIncrementedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.caller = caller;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handleMessageUpdated(event: ethereum.Event): void {
  const caller = event.parameters[0].value.toAddress().toHexString();
  
  let eventEntity = new MessageUpdatedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.caller = caller;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handleBalanceDeposited(event: ethereum.Event): void {
  const depositor = event.parameters[0].value.toAddress().toHexString();
  
  let eventEntity = new BalanceDepositedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.depositor = depositor;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handleBalanceWithdrawn(event: ethereum.Event): void {
  const withdrawer = event.parameters[0].value.toAddress().toHexString();
  
  let eventEntity = new BalanceWithdrawnEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.withdrawer = withdrawer;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}

export function handleStateSnapshot(event: ethereum.Event): void {
  const caller = event.parameters[0].value.toAddress().toHexString();
  
  let eventEntity = new StateSnapshotEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  eventEntity.caller = caller;
  eventEntity.timestamp = event.block.timestamp;
  eventEntity.blockNumber = event.block.number;
  eventEntity.transactionHash = event.transaction.hash.toHexString();
  eventEntity.save();
}
