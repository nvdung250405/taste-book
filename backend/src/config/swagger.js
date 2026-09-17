import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import YAML from "yaml";

const swaggerYamlPath = path.resolve(__dirname, "../../swagger.yaml");
let swaggerDocument = null;

try {
  if (fs.existsSync(swaggerYamlPath)) {
    const file = fs.readFileSync(swaggerYamlPath, "utf8");
    swaggerDocument = YAML.parse(file);
    if (swaggerDocument && swaggerDocument.servers && swaggerDocument.servers[0]) {
      swaggerDocument.servers[0].url = `http://localhost:${process.env.PORT || 5000}/api/v1`;
    }
  }
} catch (error) {
  console.error("Lỗi khi đọc file swagger.yaml:", error);
}

const configSwagger = (app) => {
  if (swaggerDocument) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};

export default configSwagger;
