import authService from "../../src/services/authService";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";
import { Op, QueryTypes } from "sequelize";
import { normalizePhoneNumber } from "../../src/utils/phoneUtils";
const phoneMigration = require("../../src/migrations/18-normalize-user-phones");

describe("#136: migration chuẩn hóa SĐT cũ", () => {
  let transaction;
  let queryInterface;
  beforeEach(() => {
    transaction = {};
    queryInterface = {
      sequelize: { transaction: jest.fn(async work => work(transaction)), query: jest.fn() },
      bulkUpdate: jest.fn(),
    };
    queryInterface.sequelize.query.mockResolvedValueOnce([]);
  });
  test("chuẩn hóa +84 và trim, không ghi lại số đã chuẩn", async () => {
    queryInterface.sequelize.query.mockResolvedValueOnce([
      { id: 1, phone: " +84912345678 " }, { id: 2, phone: "0988888888" },
    ]);
    await phoneMigration.up(queryInterface, { QueryTypes });
    expect(queryInterface.bulkUpdate).toHaveBeenCalledTimes(1);
    expect(queryInterface.bulkUpdate).toHaveBeenCalledWith("Users", { phone: "0912345678" }, { id: 1 }, { transaction });
  });
  test.each([
    [[{ id: 1, phone: "+84912345678" }, { id: 2, phone: "0912345678" }], /trùng số điện thoại/],
    [[{ id: 1, phone: "+84912345678" }, { id: 2, phone: "invalid" }], /không hợp lệ/],
  ])("dừng trước khi ghi khi dữ liệu cũ có xung đột: %j", async (users, message) => {
    queryInterface.sequelize.query.mockResolvedValueOnce(users);
    await expect(phoneMigration.up(queryInterface, { QueryTypes })).rejects.toThrow(message);
    expect(queryInterface.bulkUpdate).not.toHaveBeenCalled();
  });
});

describe("AuthService Unit Tests", () => {
  test.each(["0912345678", "+84912345678", "  +84912345678  "])("#136: chuẩn hóa %s thành 0912345678", phone => {
    expect(normalizePhoneNumber(phone)).toBe("0912345678");
  });
  test.each([null, undefined, 912345678, true, [], {}, "", "12345", "+840912345678", "0212345678", "091 2345678"])("#136: không chấp nhận SĐT không hợp lệ %p", phone => {
    expect(normalizePhoneNumber(phone)).toBeNull();
  });
  test("#136: đăng ký lưu dạng 0 và tra trùng bằng cùng dạng", async () => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(null);
    jest.spyOn(db.User, "create").mockImplementation(async values => ({ id: 1, ...values }));
    const result = await authService.registerNewUser({
      username: "Lan", email: "lan@example.com", password: "password123", confirmPassword: "password123", phone: " +84912345678 ",
    });
    expect(result.EC).toBe(0);
    expect(result.DT.phone).toBe("0912345678");
    expect(db.User.findOne).toHaveBeenCalledWith({ where: { phone: "0912345678" } });
    expect(db.User.create).toHaveBeenCalledWith(expect.objectContaining({ phone: "0912345678" }));
  });
  test.each(["0912345678", "+84912345678"])("#136: checkPhoneExist chuẩn hóa %s", async phone => {
    jest.spyOn(db.User, "findOne").mockResolvedValue({ id: 1 });
    expect(await authService.checkPhoneExist(phone)).toBe(true);
    expect(db.User.findOne).toHaveBeenCalledWith({ where: { phone: "0912345678" } });
  });
  test.each(["0912345678", "+84912345678", "user@example.com"])("#136: đăng nhập tra cứu %s đúng dạng", async valueLogin => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(null);
    await authService.handleUserLogin({ valueLogin, password: "password123" });
    const expected = valueLogin.includes("@") ? valueLogin : "0912345678";
    expect(db.User.findOne).toHaveBeenCalledWith({ where: { [Op.or]: [{ email: expected }, { phone: expected }] } });
  });
  test("#136: unique constraint chặn đăng ký cạnh tranh vẫn trả lỗi trùng", async () => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(null);
    jest.spyOn(db.User, "create").mockRejectedValue({ name: "SequelizeUniqueConstraintError", fields: { phone: "0912345678" } });
    expect(await authService.registerNewUser({ username: "Lan", email: "lan@example.com",
      password: "password123", confirmPassword: "password123", phone: "+84912345678" })).toMatchObject({ EC: 2, DT: null });
  });
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("hashUserPassword (#68)", () => {
    test("cùng mật khẩu tạo hash và salt khác nhau với cost factor 10", () => {
      const password = "password123";
      const firstHash = authService.hashUserPassword(password);
      const secondHash = authService.hashUserPassword(password);

      expect(firstHash).not.toBe(secondHash);
      expect(bcrypt.getSalt(firstHash)).not.toBe(bcrypt.getSalt(secondHash));
      for (const hash of [firstHash, secondHash]) {
        expect(bcrypt.getRounds(hash)).toBe(10);
        expect(bcrypt.compareSync(password, hash)).toBe(true);
        expect(bcrypt.compareSync("wrongpassword", hash)).toBe(false);
      }
    });
  });

  describe("registerNewUser", () => {
    test("thành công: đăng ký người dùng mới với thông tin hợp lệ (EC: 0)", async () => {
      const userData = {
        username: "nguyenvana",
        email: "nguyenvana@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(null);
      jest.spyOn(db.User, "create").mockResolvedValue({
        id: 1,
        username: "nguyenvana",
        email: "nguyenvana@example.com",
      });

      const res = await authService.registerNewUser(userData);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toBeDefined();
      expect(res.DT.userId).toBe(1);
      expect(res.DT.email).toBe("nguyenvana@example.com");
      const savedPassword = db.User.create.mock.calls[0][0].password;
      expect(bcrypt.compareSync(userData.password, savedPassword)).toBe(true);
    });

    test("thất bại: thiếu trường bắt buộc (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("đầy đủ các thông tin bắt buộc");
    });

    test("thất bại: email không đúng định dạng (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "invalid-email-format",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Địa chỉ Email không đúng định dạng");
    });

    test("thất bại: số điện thoại không hợp lệ (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "12345",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Số điện thoại không đúng định dạng");
    });

    test("thất bại: mật khẩu ngắn hơn 6 ký tự (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("từ 6 ký tự trở lên");
    });

    test("thất bại: mật khẩu xác nhận không trùng khớp (EC: 1)", async () => {
      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "test@example.com",
        password: "password123",
        confirmPassword: "differentpassword",
        phone: "0912345678",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không trùng khớp");
    });

    test("thất bại: email đã tồn tại trên hệ thống (EC: 2)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValueOnce({ id: 1, email: "exist@example.com" });

      const res = await authService.registerNewUser({
        username: "nguyenvana",
        email: "exist@example.com",
        password: "password123",
        confirmPassword: "password123",
        phone: "0912345678",
      });

      expect(res.EC).toBe(2);
      expect(res.EM).toContain("đã được đăng ký");
    });
  });

  describe("handleUserLogin", () => {
    test("thành công: đăng nhập đúng email và mật khẩu (EC: 0)", async () => {
      const mockUser = {
        id: 1,
        username: "nguyenvana",
        email: "user@example.com",
        password: bcrypt.hashSync("password123", 10),
        status: "Active",
        role: "User",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await authService.handleUserLogin({
        valueLogin: "user@example.com",
        password: "password123",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toHaveProperty("accessToken");
      expect(res.DT.user.email).toBe("user@example.com");
    });

    test("thất bại: để trống thông tin đăng nhập (EC: 1)", async () => {
      const res = await authService.handleUserLogin({
        valueLogin: "",
        password: "",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Vui lòng nhập tài khoản và mật khẩu");
    });

    test("thất bại: tài khoản không tồn tại (EC: 6)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);

      const res = await authService.handleUserLogin({
        valueLogin: "notfound@example.com",
        password: "password123",
      });

      expect(res.EC).toBe(6);
      expect(res.EM).toContain("không chính xác");
    });

    test("thất bại: mật khẩu không chính xác (EC: 6)", async () => {
      const mockUser = {
        id: 1,
        email: "user@example.com",
        password: bcrypt.hashSync("correctpassword", 10),
        status: "Active",
        role: "User",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await authService.handleUserLogin({
        valueLogin: "user@example.com",
        password: "wrongpassword",
      });

      expect(res.EC).toBe(6);
      expect(res.EM).toContain("không chính xác");
    });
  });

  describe("handleUserLogout", () => {
    test("thành công: đăng xuất chỉ sau khi lưu thu hồi token", async () => {
      jest.spyOn(db.RevokedToken, "findOrCreate").mockResolvedValue([{}, true]);
      const res = await authService.handleUserLogout(createJWT({ userId: 1 }));
      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT).toBeNull();
      expect(db.RevokedToken.findOrCreate).toHaveBeenCalledTimes(1);
    });
  });
});
