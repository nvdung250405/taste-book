import userService from "../../src/services/userService";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";

describe("UserService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getUserProfile (UC-05)", () => {
    test("thành công: lấy thông tin cá nhân đúng ID (EC: 0)", async () => {
      const mockUser = {
        id: 10,
        username: "nguyenvana",
        email: "a@example.com",
        phone: "0912345678",
        avatarUrl: "https://cloudinary.com/avatar.jpg",
        role: "User",
        createdAt: "2026-09-01T00:00:00.000Z",
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await userService.getUserProfile(10);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT.userId).toBe(10);
      expect(res.DT.username).toBe("nguyenvana");
      expect(res.DT.email).toBe("a@example.com");
    });

    test("thất bại: không tìm thấy người dùng (EC: 3)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);

      const res = await userService.getUserProfile(999);

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy người dùng");
      expect(res.DT).toBeNull();
    });
  });

  describe("updateUserProfile (UC-05)", () => {
    test("thành công: cập nhật tên hiển thị và số điện thoại hợp lệ (EC: 0)", async () => {
      const mockUser = {
        id: 10,
        username: "old_name",
        phone: "0911111111",
        avatarUrl: "old_avatar.jpg",
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.User, "findOne")
        .mockResolvedValueOnce(mockUser) // find user
        .mockResolvedValueOnce(null);    // check phone duplicate

      const res = await userService.updateUserProfile(10, {
        username: "new_name",
        phone: "0988888888",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(mockUser.update).toHaveBeenCalled();
    });

    test("thất bại: tên hiển thị rỗng (EC: 1)", async () => {
      const res = await userService.updateUserProfile(10, {
        username: "   ",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được để trống");
    });

    test("thất bại: số điện thoại sai định dạng (EC: 1)", async () => {
      const mockUser = { id: 10, username: "user" };
      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await userService.updateUserProfile(10, {
        username: "user",
        phone: "invalid_phone_123",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Số điện thoại không đúng định dạng");
    });

    test("thất bại: số điện thoại bị trùng với người dùng khác (EC: 2)", async () => {
      const mockUser = { id: 10, username: "user", phone: "0911111111" };
      const existingUser = { id: 20, phone: "0922222222" };

      jest.spyOn(db.User, "findOne")
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(existingUser);

      const res = await userService.updateUserProfile(10, {
        username: "user",
        phone: "0922222222",
      });

      expect(res.EC).toBe(2);
      expect(res.EM).toContain("đã được đăng ký");
    });

    test("thất bại: người dùng không tồn tại (EC: 3)", async () => {
      jest.spyOn(db.User, "findOne").mockResolvedValue(null);

      const res = await userService.updateUserProfile(999, {
        username: "user",
      });

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy người dùng");
    });
  });

  describe("changeUserPassword (UC-05)", () => {
    test("thành công: đổi mật khẩu khi nhập đúng mật khẩu cũ và xác nhận khớp (EC: 0)", async () => {
      const oldPasswordHash = bcrypt.hashSync("oldPassword123", 10);
      const mockUser = {
        id: 10,
        password: oldPasswordHash,
        update: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await userService.changeUserPassword(10, {
        oldPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmNewPassword: "newPassword456",
      });

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(mockUser.update).toHaveBeenCalled();
    });

    test("thất bại: thiếu trường mật khẩu cũ hoặc mật khẩu mới (EC: 1)", async () => {
      const res = await userService.changeUserPassword(10, {
        oldPassword: "",
        newPassword: "123",
        confirmNewPassword: "",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("Vui lòng nhập đầy đủ");
    });

    test("thất bại: mật khẩu mới trùng mật khẩu cũ (EC: 1)", async () => {
      const res = await userService.changeUserPassword(10, {
        oldPassword: "samepassword",
        newPassword: "samepassword",
        confirmNewPassword: "samepassword",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không được trùng mật khẩu cũ");
    });

    test("thất bại: xác nhận mật khẩu mới không khớp (EC: 1)", async () => {
      const res = await userService.changeUserPassword(10, {
        oldPassword: "oldPassword123",
        newPassword: "newPassword456",
        confirmNewPassword: "differentConfirm",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("xác nhận không khớp");
    });

    test("thất bại: mật khẩu mới dưới 6 ký tự (EC: 1)", async () => {
      const res = await userService.changeUserPassword(10, {
        oldPassword: "oldPassword123",
        newPassword: "123",
        confirmNewPassword: "123",
      });

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("từ 6 ký tự trở lên");
    });

    test("thất bại: mật khẩu cũ nhập không chính xác (EC: 6)", async () => {
      const oldPasswordHash = bcrypt.hashSync("correctOldPassword", 10);
      const mockUser = {
        id: 10,
        password: oldPasswordHash,
      };

      jest.spyOn(db.User, "findOne").mockResolvedValue(mockUser);

      const res = await userService.changeUserPassword(10, {
        oldPassword: "wrongOldPassword",
        newPassword: "newPassword456",
        confirmNewPassword: "newPassword456",
      });

      expect(res.EC).toBe(6);
      expect(res.EM).toContain("không chính xác");
    });
  });
});
