import { Router, Request, Response } from "express";
import { z } from "zod";
import { BlockchainService } from "../services/blockchain.service";

const router = Router();

const blockchainService = new BlockchainService(
  process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
  process.env.HYPNOS_EXECUTOR_ADDRESS,
  process.env.HYPNOS_DEMO_ADDRESS
);

const txHashSchema = z.object({
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
});

router.get("/:txHash", async (req: Request, res: Response) => {
  try {
    const { txHash } = txHashSchema.parse({ txHash: req.params.txHash });

    const trace = await blockchainService.getTransactionTrace(txHash);

    // Parse events
    const events = [];
    for (const log of trace.logs) {
      const parsed = await blockchainService.parseEventLog(log);
      if (parsed) {
        events.push({
          name: parsed.name,
          args: parsed.args,
        });
      }
    }

    res.json({
      success: true,
      data: {
        ...trace,
        parsedEvents: events,
      },
    });
  } catch (error: any) {
    console.error("Transaction fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export { router as transactionRouter };
