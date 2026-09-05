import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TasteBook API Documentation",
      version: "1.0.0",
      description: "Tài liệu đặc tả API cho dự án TasteBook",
    },
    servers: [
      {
        url: "http://localhost:8080/api/v1",
        description: "Local Development Server",
      },
    ],
  },
  // Đường dẫn quét các file chứa chú thích Swagger (@swagger)
  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJSDoc(options);

const configSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default configSwagger;
