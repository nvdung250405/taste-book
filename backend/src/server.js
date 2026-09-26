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
const app = express();
const PORT = process.env.PORT || 5000;

//config cors
configCors(app);

//config request logger
app.use(requestLogger);

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
    EC: -1,
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
