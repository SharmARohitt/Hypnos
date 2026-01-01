import { ethers } from "ethers";
import { HypnosExecutor__factory, HypnosDemo__factory } from "../../../contracts/typechain-types";

export interface TransactionTrace {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  gasPrice: string;
  status: number;
  blockNumber: number;
  timestamp: number;
  logs: Array<{
    address: string;
    topics: string[];
    data: string;
  }>;
  receipt?: ethers.TransactionReceipt;
}

export interface PermissionData {
  permissionId: string;
  target: string;
  selector: string;
  maxValue: string;
  maxTokenAmount: string;
  tokenAddress: string;
  expiry: number;
  active: boolean;
}

export interface ExecutionData {
  executor: string;
  target: string;
  selector: string;
  value: string;
  timestamp: number;
  permissionId: string;
  success: boolean;
  reason: string;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private executorContract: ethers.Contract | null = null;
  private demoContract: ethers.Contract | null = null;

  constructor(rpcUrl: string, executorAddress?: string, demoAddress?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (executorAddress) {
      this.executorContract = new ethers.Contract(
        executorAddress,
        HypnosExecutor__factory.abi,
        this.provider
      );
    }
    
    if (demoAddress) {
      this.demoContract = new ethers.Contract(
        demoAddress,
        HypnosDemo__factory.abi,
        this.provider
      );
    }
  }

  async getTransactionTrace(txHash: string): Promise<TransactionTrace> {
    const receipt = await this.provider.getTransactionReceipt(txHash);
    const tx = await this.provider.getTransaction(txHash);
    const block = await this.provider.getBlock(receipt!.blockNumber);

    if (!receipt || !tx || !block) {
      throw new Error("Transaction not found");
    }

    return {
      hash: txHash,
      from: receipt.from,
      to: receipt.to || "",
      value: tx.value.toString(),
      gasUsed: receipt.gasUsed.toString(),
      gasPrice: tx.gasPrice?.toString() || "0",
      status: receipt.status || 0,
      blockNumber: receipt.blockNumber,
      timestamp: block.timestamp,
      logs: receipt.logs.map((log) => ({
        address: log.address,
        topics: log.topics.map((t) => t),
        data: log.data,
      })),
      receipt,
    };
  }

  async getPermission(
    executorAddress: string,
    permissionId: string
  ): Promise<PermissionData | null> {
    if (!this.executorContract) {
      throw new Error("Executor contract not initialized");
    }

    try {
      const permission = await this.executorContract.getPermission(
        executorAddress,
        permissionId
      );

      if (!permission || permission.target === ethers.ZeroAddress) {
        return null;
      }

      return {
        permissionId,
        target: permission.target,
        selector: permission.selector,
        maxValue: permission.maxValue.toString(),
        maxTokenAmount: permission.maxTokenAmount.toString(),
        tokenAddress: permission.tokenAddress,
        expiry: Number(permission.expiry),
        active: permission.active,
      };
    } catch (error) {
      console.error("Error fetching permission:", error);
      return null;
    }
  }

  async getExecution(executionId: string): Promise<ExecutionData | null> {
    if (!this.executorContract) {
      throw new Error("Executor contract not initialized");
    }

    try {
      const execution = await this.executorContract.getExecution(executionId);

      if (!execution || execution.executor === ethers.ZeroAddress) {
        return null;
      }

      return {
        executor: execution.executor,
        target: execution.target,
        selector: execution.selector,
        value: execution.value.toString(),
        timestamp: Number(execution.timestamp),
        permissionId: execution.permissionId,
        success: execution.success,
        reason: execution.reason,
      };
    } catch (error) {
      console.error("Error fetching execution:", error);
      return null;
    }
  }

  async parseEventLog(log: { address: string; topics: string[]; data: string }) {
    // Try to parse with executor contract
    if (this.executorContract && log.address.toLowerCase() === this.executorContract.target.toLowerCase()) {
      try {
        const parsed = this.executorContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        return parsed;
      } catch (e) {
        // Not an executor event
      }
    }

    // Try to parse with demo contract
    if (this.demoContract && log.address.toLowerCase() === this.demoContract.target.toLowerCase()) {
      try {
        const parsed = this.demoContract.interface.parseLog({
          topics: log.topics as string[],
          data: log.data,
        });
        return parsed;
      } catch (e) {
        // Not a demo event
      }
    }

    return null;
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }
}
