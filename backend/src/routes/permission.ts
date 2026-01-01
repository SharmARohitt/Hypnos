import { Router, Request, Response } from "express";
import { z } from "zod";
import { BlockchainService } from "../services/blockchain.service";

const router = Router();

const blockchainService = new BlockchainService(
  process.env.SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_KEY",
  process.env.HYPNOS_EXECUTOR_ADDRESS
);

const permissionRequestSchema = z.object({
  executorAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid address"),
  permissionId: z.string(),
});

router.get("/:executorAddress/:permissionId", async (req: Request, res: Response) => {
  try {
    const params = permissionRequestSchema.parse({
      executorAddress: req.params.executorAddress,
      permissionId: req.params.permissionId,
    });

    const permission = await blockchainService.getPermission(
      params.executorAddress,
      params.permissionId
    );

    if (!permission) {
      return res.status(404).json({
        success: false,
        error: "Permission not found",
      });
    }

    res.json({
      success: true,
      data: permission,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation error",
        details: error.errors,
      });
    }

    console.error("Permission fetch error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
});

export { router as permissionRouter };
