import { Router, Request, Response } from "express";
import { z } from "zod";
import { BlockchainService } from "../services/blockchain.service";
import { AIService } from "../services/ai.service";

const router = Router();

// Initialize services
const blockchainService = new BlockchainService(
  process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
  process.env.HYPNOS_EXECUTOR_ADDRESS,
  process.env.HYPNOS_DEMO_ADDRESS
);

const aiService = new AIService(
  blockchainService,
  process.env.OPENAI_API_KEY
);

const explanationRequestSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
  executorAddress: z.string().optional(),
  permissionId: z.string().optional(),
  executionId: z.string().optional(),
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = explanationRequestSchema.parse(req.body);

    // Fetch permission if provided
    let permission = undefined;
    if (body.executorAddress && body.permissionId) {
      permission = await blockchainService.getPermission(
        body.executorAddress,
        body.permissionId
      );
    }

    // Fetch execution if provided
    let execution = undefined;
    if (body.executionId) {
      execution = await blockchainService.getExecution(body.executionId);
    }

    // Get AI explanation
    const explanation = await aiService.explainExecution(
      body.txHash,
      permission || undefined,
      execution || undefined
    );

    res.json({
      success: true,
      data: explanation,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Explanation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export { router as explanationRouter };
