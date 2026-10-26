import express from "express";
import configViewEngine from "./config/viewEngine";
import initApiRoutes from "./routes/api";
import configCors from "./config/cors";
require("dotenv").config();
import connection from "./config/connectDB";
import configSwagger from "./config/swagger";
import logger from "./config/logger";
import requestLogger from "./middleware/requestLogger";
import errorHandler from "./middleware/errorHandler";
import { configureTrustProxy } from "./config/trustProxy";
import { apiLimiter } from "./middleware/apiRateLimit";
const app = express();
configureTrustProxy(app);
const PORT = process.env.PORT || 5000;

// Log CORS rejections as well as rate-limited responses.
app.use(requestLogger);
configCors(app);

// Liveness only: this does not assert database readiness.
app.get("/healthz", (req, res) => res.status(200).json({ status: "ok" }));

// Shared budget across all API routes, before parsing/authentication/DB work.
app.use("/api/v1", apiLimiter);

//config view engine
configViewEngine(app);

//config body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//test connection db
if (process.env.NODE_ENV !== "test") {
  connection();
}

// Khởi chạy Swagger UI
configSwagger(app);

//init web routes
initApiRoutes(app);

//req => middleware => res
app.use((req, res) => {
  return res.status(404).json({
    EC: 3,
    EM: "API endpoint not found.",
    DT: null,
  });
});

//config error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    logger.info(`tastebook backend is running on the port = ${PORT}`);
  });
}

export default app;
