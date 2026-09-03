import db from "../models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";

const salt = bcrypt.genSaltSync(10);

const hashUserPassword = (userPassword) => {
  return bcrypt.hashSync(userPassword, salt);
};

const seedAdminUser = async () => {
  try {
    let adminEmail = "admin@gmail.com";
    let adminPhone = "0999999999";
    let adminExists = await db.User.findOne({
      where: {
        [Op.or]: [{ email: adminEmail }, { phone: adminPhone }],
      },
    });

    if (!adminExists) {
      let hashPassword = hashUserPassword("admin123");
      await db.User.create({
        email: adminEmail,
        username: "System Admin",
        password: hashPassword,
        phone: adminPhone,
        role: "Admin",
      });
      console.log(">>> Default Admin created: admin@gmail.com / admin123");
    }
  } catch (e) {
    console.error(">>> Error seeding admin user:", e);
  }
};

const initDatabase = async () => {
  await seedAdminUser();
};

export default initDatabase;
