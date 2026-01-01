import { HypnosExecutor } from "../generated/HypnosExecutor/HypnosExecutor";
import { HypnosDemo } from "../generated/HypnosDemo/HypnosDemo";
import {
  HypnosExecutor as HypnosExecutorTemplate,
  HypnosDemo as HypnosDemoTemplate,
} from "../generated/templates";
import {
  handlePermissionGranted,
  handlePermissionRevoked,
  handlePermissionUsed,
  handleExecutionRecorded,
} from "./HypnosExecutor";
import {
  handleCounterIncremented,
  handleMessageUpdated,
  handleBalanceDeposited,
  handleBalanceWithdrawn,
  handleStateSnapshot,
} from "./HypnosDemo";

export function handleHypnosExecutor(event: any): void {
  // Route to appropriate handler based on event signature
  if (event.eventName == "PermissionGranted") {
    handlePermissionGranted(event as any);
  } else if (event.eventName == "PermissionRevoked") {
    handlePermissionRevoked(event as any);
  } else if (event.eventName == "PermissionUsed") {
    handlePermissionUsed(event as any);
  } else if (event.eventName == "ExecutionRecorded") {
    handleExecutionRecorded(event as any);
  }
}

export function handleHypnosDemo(event: any): void {
  // Route to appropriate handler based on event signature
  if (event.eventName == "CounterIncremented") {
    handleCounterIncremented(event as any);
  } else if (event.eventName == "MessageUpdated") {
    handleMessageUpdated(event as any);
  } else if (event.eventName == "BalanceDeposited") {
    handleBalanceDeposited(event as any);
  } else if (event.eventName == "BalanceWithdrawn") {
    handleBalanceWithdrawn(event as any);
  } else if (event.eventName == "StateSnapshot") {
    handleStateSnapshot(event as any);
  }
}
