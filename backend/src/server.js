const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const config = require("./config");
require("./db");

const authRoutes = require("./routes/auth");
const workflowRoutes = require("./routes/workflow");
const agentRoutes = require("./routes/agent");
const defiRoutes = require("./routes/defi");
const resolveRoutes = require("./routes/resolve");

const app = express();
const allowedOrigins = new Set(config.frontendUrls);

function corsOrigin(origin, callback) {
  if (!origin || allowedOrigins.has(origin)) {
    return callback(null, true);
  }

  return callback(new Error(`CORS blocked for origin: ${origin}`));
}

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "initiate-ai-s1" });
});

app.use("/api/auth", authRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/defi", defiRoutes);
app.use("/api/resolve", resolveRoutes);

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

app.use((error, _req, res, _next) => {
  const status = error.statusCode || 500;
  res.status(status).json({
    error: error.message || "Internal server error",
    details: config.env === "production" ? undefined : error.stack,
  });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});

