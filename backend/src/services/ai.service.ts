import OpenAI from "openai";
import { BlockchainService, TransactionTrace, PermissionData, ExecutionData } from "./blockchain.service";

export interface ExplanationResult {
  summary: string;
  causality: string;
  permissionAnalysis: {
    usedPermission: string | null;
    permissionConstraints: string[];
    allowedActions: string[];
    blockedActions: string[];
  };
  stateTransitions: Array<{
    from: string;
    to: string;
    reason: string;
  }>;
  safetyAnalysis: {
    riskLevel: "low" | "medium" | "high";
    reasons: string[];
    constraints: string[];
  };
  traceability: {
    transactionHash: string;
    blockNumber: number;
    events: Array<{
      name: string;
      data: Record<string, any>;
    }>;
  };
}

export class AIService {
  private openai: OpenAI | null = null;
  private blockchainService: BlockchainService;

  constructor(blockchainService: BlockchainService, openaiApiKey?: string) {
    this.blockchainService = blockchainService;
    
    if (openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: openaiApiKey,
      });
    }
  }

  async explainExecution(
    txHash: string,
    permission?: PermissionData,
    execution?: ExecutionData
  ): Promise<ExplanationResult> {
    const trace = await this.blockchainService.getTransactionTrace(txHash);
    
    // Parse events
    const events = [];
    for (const log of trace.logs) {
      const parsed = await this.blockchainService.parseEventLog(log);
      if (parsed) {
        events.push({
          name: parsed.name,
          data: parsed.args,
        });
      }
    }

    // Build context for AI
    const context = this.buildContext(trace, permission, execution, events);

    if (this.openai) {
      return await this.explainWithAI(context);
    } else {
      // Fallback to rule-based explanation
      return this.explainWithRules(context);
    }
  }

  private buildContext(
    trace: TransactionTrace,
    permission?: PermissionData,
    execution?: ExecutionData,
    events: Array<{ name: string; data: any }> = []
  ): string {
    let context = `Transaction Analysis Context:\n\n`;
    context += `Transaction Hash: ${trace.hash}\n`;
    context += `From: ${trace.from}\n`;
    context += `To: ${trace.to}\n`;
    context += `Value: ${trace.value} wei\n`;
    context += `Status: ${trace.status === 1 ? "SUCCESS" : "FAILED"}\n`;
    context += `Block: ${trace.blockNumber}\n`;
    context += `Gas Used: ${trace.gasUsed}\n\n`;

    if (permission) {
      context += `Permission Details:\n`;
      context += `  Permission ID: ${permission.permissionId}\n`;
      context += `  Target: ${permission.target}\n`;
      context += `  Selector: ${permission.selector}\n`;
      context += `  Max Value: ${permission.maxValue} wei\n`;
      context += `  Max Token Amount: ${permission.maxTokenAmount}\n`;
      context += `  Token Address: ${permission.tokenAddress}\n`;
      context += `  Expiry: ${permission.expiry === 0 ? "No expiry" : new Date(Number(permission.expiry) * 1000).toISOString()}\n`;
      context += `  Active: ${permission.active}\n\n`;
    }

    if (execution) {
      context += `Execution Details:\n`;
      context += `  Executor: ${execution.executor}\n`;
      context += `  Target: ${execution.target}\n`;
      context += `  Selector: ${execution.selector}\n`;
      context += `  Value: ${execution.value} wei\n`;
      context += `  Success: ${execution.success}\n`;
      context += `  Reason: ${execution.reason}\n\n`;
    }

    context += `Events (${events.length}):\n`;
    events.forEach((event, idx) => {
      context += `  ${idx + 1}. ${event.name}\n`;
      context += `     Data: ${JSON.stringify(event.data, null, 2)}\n`;
    });

    return context;
  }

  private async explainWithAI(context: string): Promise<ExplanationResult> {
    if (!this.openai) {
      throw new Error("OpenAI client not initialized");
    }

    const prompt = `You are Hypnos, a cognitive execution layer for Ethereum smart contracts. 
Analyze the following transaction and provide a detailed explanation.

${context}

Provide a JSON response with the following structure:
{
  "summary": "Brief summary of what happened",
  "causality": "Why this transaction was executed and what caused it",
  "permissionAnalysis": {
    "usedPermission": "Permission ID if applicable, or null",
    "permissionConstraints": ["List of constraints that applied"],
    "allowedActions": ["What was explicitly allowed"],
    "blockedActions": ["What would have been blocked"]
  },
  "stateTransitions": [
    {
      "from": "Previous state",
      "to": "New state",
      "reason": "Why this transition occurred"
    }
  ],
  "safetyAnalysis": {
    "riskLevel": "low|medium|high",
    "reasons": ["Why this risk level"],
    "constraints": ["Safety constraints that were in place"]
  }
}

Be specific, factual, and reference the actual data provided. Do not speculate.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: "You are Hypnos, an expert at analyzing Ethereum smart contract executions. You provide deterministic, traceable explanations grounded in on-chain data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more deterministic output
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from AI");
      }

      const parsed = JSON.parse(content);
      
      // Extract transaction hash from context for traceability
      const txHashMatch = context.match(/Transaction Hash: ([0-9a-fA-F]{66})/);
      const blockMatch = context.match(/Block: (\d+)/);
      
      return {
        ...parsed,
        traceability: {
          transactionHash: txHashMatch?.[1] || "unknown",
          blockNumber: parseInt(blockMatch?.[1] || "0"),
          events: [], // Will be populated from context
        },
      };
    } catch (error) {
      console.error("AI explanation error:", error);
      // Fallback to rule-based
      return this.explainWithRules(context);
    }
  }

  private explainWithRules(context: string): ExplanationResult {
    // Rule-based explanation as fallback
    const txHashMatch = context.match(/Transaction Hash: ([0-9a-fA-F]{66})/);
    const blockMatch = context.match(/Block: (\d+)/);
    const statusMatch = context.match(/Status: (SUCCESS|FAILED)/);
    const success = statusMatch?.[1] === "SUCCESS";

    return {
      summary: success
        ? "Transaction executed successfully through permission-gated execution"
        : "Transaction failed - see reason for details",
      causality: "Transaction was executed via HypnosExecutor with permission checks",
      permissionAnalysis: {
        usedPermission: null,
        permissionConstraints: ["Value must be within maxValue limit", "Target must match permission target"],
        allowedActions: ["Execution within permission bounds"],
        blockedActions: ["Execution exceeding permission limits", "Execution to unauthorized targets"],
      },
      stateTransitions: [],
      safetyAnalysis: {
        riskLevel: "low",
        reasons: ["Permission-gated execution", "Reentrancy protection", "Value limits enforced"],
        constraints: ["Permission expiry checks", "Value limits", "Target validation"],
      },
      traceability: {
        transactionHash: txHashMatch?.[1] || "unknown",
        blockNumber: parseInt(blockMatch?.[1] || "0"),
        events: [],
      },
    };
  }
}
