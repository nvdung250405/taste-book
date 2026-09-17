const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE_NAME,
  process.env.DB_USERNAME,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    dialectOptions: {
      useUTC: false, // Prevents converting local timestamp to UTC +0
      // Bật ssl nếu dùng database trên Cloud (Supabase/Neon/Render)
      // ssl: {
      //   require: true,
      //   rejectUnauthorized: false
      // }
    },
    timezone: "+07:00",
    define: {
      freezeTableName: true,
    },
    logging: false,
  },
);

const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to PostgreSQL has been established successfully.");
    // Kích hoạt extension unaccent để hỗ trợ tìm kiếm tiếng Việt không dấu
    await sequelize.query("CREATE EXTENSION IF NOT EXISTS unaccent;");
  } catch (error) {
    console.error("Unable to connect to PostgreSQL:", error);
  }
};

export default connection;
