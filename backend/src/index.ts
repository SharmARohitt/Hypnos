import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { explanationRouter } from "./routes/explanation";
import { transactionRouter } from "./routes/transaction";
import { permissionRouter } from "./routes/permission";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "hypnos-backend" });
});

// Routes
app.use("/api/explain", explanationRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/permission", permissionRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hypnos Backend API running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});
