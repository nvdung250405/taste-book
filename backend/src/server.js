import express from "express";
import configViewEngine from "./config/viewEngine";
import initApiRoutes from "./routes/api";
import configCors from "./config/cors";
require("dotenv").config();
import cookieParser from "cookie-parser";
import connection from "./config/connectDB";
import configSwagger from "./config/swagger";
const app = express();
const PORT = process.env.PORT || 5000;

//config cors
configCors(app);

//config view engine
configViewEngine(app);

//config body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//config cookie parser
app.use(cookieParser());

//test connection db
connection();

// Khởi chạy Swagger UI
configSwagger(app);

//init web routes
initApiRoutes(app);

//req => middleware => res
app.use((req, res) => {
  return res.send("404 not found");
});

app.listen(PORT, () => {
  console.log("tastebook backend is running on the port = ", PORT);
});
