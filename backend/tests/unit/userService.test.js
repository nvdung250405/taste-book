import userService from "../../src/services/userService";
import db from "../../src/models/index";
import bcrypt from "bcryptjs";
import { Op } from "sequelize";
import { cloudinary } from "../../src/config/cloudinary";

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
    beforeEach(() => {
      jest.replaceProperty(process, "env", { ...process.env, CLOUDINARY_CLOUD_NAME: "demo" });
    });

    describe("avatar URL validation (#70)", () => {
      let user;
      let resource;
      let fetchSpy;
      const validUrl = "https://res.cloudinary.com/demo/image/upload/v123/tastebook_uploads/avatar.png";

      beforeEach(() => {
        user = { id: 10, avatarUrl: "old-avatar.png", update: jest.fn().mockResolvedValue(true) };
        jest.spyOn(db.User, "findOne").mockResolvedValue(user);
        resource = jest.spyOn(cloudinary.api, "resource").mockResolvedValue({ bytes: 1024 });
        fetchSpy = jest.spyOn(global, "fetch").mockRejectedValue(new Error("Unexpected fetch"));
      });

      test.each([
        "http://169.254.169.254/latest/meta-data/",
        "http://localhost:5432/",
        "http://127.0.0.1/",
        "http://10.0.0.8/",
        "http://[::1]/",
        "https://example.com/demo/image/upload/v123/avatar.png",
        "https://res.cloudinary.com.evil.test/demo/image/upload/v123/avatar.png",
        "https://res.cloudinary.com@evil.test/demo/image/upload/v123/avatar.png",
        "https://evil.test@res.cloudinary.com/demo/image/upload/v123/avatar.png",
        "https://res.cloudinary.com/another-cloud/image/upload/v123/avatar.png",
        "https://res.cloudinary.com/demo-other/image/upload/v123/avatar.png",
        "http://res.cloudinary.com/demo/image/upload/v123/avatar.png",
        "https://res.cloudinary.com:8443/demo/image/upload/v123/avatar.png",
        "https://res.cloudinary.com/demo/video/upload/v123/avatar.png",
        "https://res.cloudinary.com/demo/image/fetch/https://example.com/avatar.png",
        "https://res.cloudinary.com/demo/image/upload/",
        "not-a-url",
        123,
        {},
      ])("từ chối avatar không tin cậy mà không gọi mạng: %j", async (avatarUrl) => {
        // Kiểm tra cả URL mới và URL không hợp lệ đã có sẵn trong hồ sơ.
        for (const oldUrl of ["old-avatar.png", avatarUrl]) {
          user.avatarUrl = oldUrl;
          const result = await userService.updateUserProfile(10, { username: "user", avatarUrl });
          expect(result.EC).toBe(1);
        }
        expect(user.update).not.toHaveBeenCalled();
        expect(resource).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      test.each([validUrl, validUrl.replace("v123/", "") + "?version=1#avatar"])(
        "chấp nhận ảnh đúng cloud và lấy dung lượng bằng SDK: %s", async (avatarUrl) => {
          const result = await userService.updateUserProfile(10, { username: "user", avatarUrl });
          expect(result.EC).toBe(0);
          expect(resource).toHaveBeenCalledWith("tastebook_uploads/avatar");
          expect(user.update).toHaveBeenCalledWith({ username: "user", avatarUrl });
          expect(fetchSpy).not.toHaveBeenCalled();
        },
      );

      test("SDK lỗi không fallback sang fetch và không lưu avatar", async () => {
        resource.mockRejectedValue(new Error("Cloudinary unavailable"));
        const result = await userService.updateUserProfile(10, { username: "user", avatarUrl: validUrl });
        expect(result.EC).not.toBe(0);
        expect(user.update).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      test.each([undefined, null, 0, -1, "1024", NaN])("từ chối metadata dung lượng không hợp lệ: %j", async (bytes) => {
        resource.mockResolvedValue({ bytes });
        const result = await userService.updateUserProfile(10, { username: "user", avatarUrl: validUrl });
        expect(result.EC).toBe(1);
        expect(user.update).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
      });

      test.each([[5 * 1024 * 1024, 0], [5 * 1024 * 1024 + 1, 1]])(
        "kiểm tra giới hạn 5MB: %i bytes trả EC %i", async (bytes, expectedEc) => {
          resource.mockResolvedValue({ bytes });
          const result = await userService.updateUserProfile(10, { username: "user", avatarUrl: validUrl });
          expect(result.EC).toBe(expectedEc);
          expect(user.update).toHaveBeenCalledTimes(expectedEc === 0 ? 1 : 0);
          expect(fetchSpy).not.toHaveBeenCalled();
        },
      );

      test("thiếu cấu hình cloud name thì từ chối trước khi gọi SDK", async () => {
        delete process.env.CLOUDINARY_CLOUD_NAME;
        const result = await userService.updateUserProfile(10, { username: "user", avatarUrl: validUrl });
        expect(result.EC).toBe(1);
        expect(resource).not.toHaveBeenCalled();
        expect(fetchSpy).not.toHaveBeenCalled();
        expect(user.update).not.toHaveBeenCalled();
      });
    });

    test("đổi avatar không tự xóa ảnh cũ chưa xác minh quyền sở hữu (#69)", async () => {
      const oldAvatarUrl = "https://res.cloudinary.com/demo/image/upload/v1/tastebook_uploads/another-user.png";
      const avatarUrl = "https://res.cloudinary.com/demo/image/upload/v2/tastebook_uploads/new-avatar.png";
      const user = { id: 10, avatarUrl: oldAvatarUrl, update: jest.fn().mockResolvedValue(true) };
      jest.spyOn(db.User, "findOne").mockResolvedValue(user);
      jest.spyOn(cloudinary.api, "resource").mockResolvedValue({ bytes: 1024 });
      const destroy = jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "ok" });

      const result = await userService.updateUserProfile(10, { username: "user", avatarUrl });

      expect(result.EC).toBe(0);
      expect(user.update).toHaveBeenCalledWith({ username: "user", avatarUrl });
      expect(destroy).not.toHaveBeenCalled();
    });

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
    test("hai người dùng đổi sang cùng mật khẩu nhận salt riêng (#68)", async () => {
      // Mô phỏng các hash cũ được tạo bằng một salt dùng chung.
      const legacySalt = bcrypt.genSaltSync(10);
      const oldPassword = "oldPassword123";
      const newPassword = "newPassword456";
      const users = [10, 20].map((id) => ({
        id,
        password: bcrypt.hashSync(oldPassword, legacySalt),
        update: jest.fn().mockResolvedValue(true),
      }));
      jest.spyOn(db.User, "findOne")
        .mockResolvedValueOnce(users[0])
        .mockResolvedValueOnce(users[1]);

      for (const user of users) {
        const result = await userService.changeUserPassword(user.id, {
          oldPassword,
          newPassword,
          confirmNewPassword: newPassword,
        });
        expect(result.EC).toBe(0);
        expect(user.update).toHaveBeenCalledTimes(1);
      }

      const hashes = users.map((user) => user.update.mock.calls[0][0].password);
      expect(hashes[0]).not.toBe(hashes[1]);
      expect(bcrypt.getSalt(hashes[0])).not.toBe(bcrypt.getSalt(hashes[1]));
      for (const hash of hashes) {
        expect(bcrypt.getRounds(hash)).toBe(10);
        expect(bcrypt.compareSync(newPassword, hash)).toBe(true);
        expect(bcrypt.compareSync(oldPassword, hash)).toBe(false);
      }
    });

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


describe("UC-24 admin user service", () => {
  const user = {
    id: 2, username: "Lan", email: "lan@example.com", phone: "0912345678",
    role: "User", createdAt: "2026-10-25T00:00:00.000Z", password: "secret-hash",
  };

  let list;
  beforeEach(() => {
    list = jest.spyOn(db.User, "findAndCountAll").mockResolvedValue({ rows: [user], count: 21 });
  });

  test("default pagination and safe response fields", async () => {
    const result = await userService.getAllUsersAdmin();
    expect(result.EC).toBe(0);
    expect(result.DT).toMatchObject({ page: 1, limit: 20, total: 21, totalPages: 2 });
    expect(result.DT.users[0]).toEqual({
      userId: 2, username: user.username, email: user.email, phone: user.phone,
      role: "User", createdAt: user.createdAt,
    });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({
      limit: 20, offset: 0, order: [["createdAt", "DESC"], ["id", "DESC"]],
      attributes: ["id", "username", "email", "phone", "role", "createdAt"],
    }));
  });

  test("combines search, normalized role and pagination before querying", async () => {
    const result = await userService.getAllUsersAdmin({ keyword: " Lan ", role: " aDmIn ", page: "2", limit: "10" });
    expect(result.DT).toMatchObject({ page: 2, limit: 10, total: 21, totalPages: 3 });
    expect(list).toHaveBeenCalledWith(expect.objectContaining({
      limit: 10, offset: 10,
      where: {
        role: "Admin",
        [Op.or]: [
          { username: { [Op.iLike]: "%Lan%" } },
          { email: { [Op.iLike]: "%Lan%" } },
          { phone: { [Op.iLike]: "%Lan%" } },
        ],
      },
    }));
  });

  test("ignores blank search and role", async () => {
    await userService.getAllUsersAdmin({ keyword: "  ", role: "  " });
    expect(list.mock.calls[0][0].where).toEqual({});
  });

  test.each([
    { page: "0" }, { page: "-1" }, { page: "1.5" }, { page: "abc" },
    { page: "" }, { page: [] }, { page: {} }, { page: true },
    { page: "9007199254740992" }, { page: "9007199254740991", limit: "100" },
    { limit: "0" }, { limit: "101" }, { limit: "-2" }, { limit: "1.5" },
    { limit: "" }, { limit: "abc" }, { limit: ["10"] }, { limit: {} },
    { keyword: ["Lan"] }, { keyword: {} }, { role: ["Admin"] },
    { role: {} }, { role: "Moderator" },
  ])("rejects invalid query without accessing DB: %j", async (query) => {
    expect(await userService.getAllUsersAdmin(query)).toMatchObject({ EC: 1, DT: null });
    expect(list).not.toHaveBeenCalled();
  });

  test("accepts maximum page size", async () => {
    const result = await userService.getAllUsersAdmin({ limit: "100" });
    expect(result.EC).toBe(0);
    expect(result.DT.limit).toBe(100);
  });

  test.each([0, 21])("empty page retains actual total %i", async (count) => {
    list.mockResolvedValue({ rows: [], count });
    const result = await userService.getAllUsersAdmin({ page: "4", limit: "10" });
    expect(result.DT).toEqual({ users: [], page: 4, limit: 10, total: count, totalPages: Math.ceil(count / 10) });
  });

  test("database failure returns generic error", async () => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    list.mockRejectedValue(new Error("private database information"));
    const result = await userService.getAllUsersAdmin();
    expect(result).toEqual({ EC: -1, EM: "Lỗi kết nối máy chủ!", DT: null });
  });

  test.each(["1abc", "1.5", "0", "-1", "1e2", "9007199254740992", "2147483648"])("rejects invalid user ID %s", async (id) => {
    const find = jest.spyOn(db.User, "findOne");
    expect(await userService.getUserDetailAdmin(id)).toMatchObject({ EC: 3, DT: null });
    expect(find).not.toHaveBeenCalled();
  });

  test("detail only exposes allowed fields", async () => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(user);
    const result = await userService.getUserDetailAdmin("2");
    expect(result.DT).toEqual({ userId: 2, username: user.username, email: user.email, phone: user.phone, role: "User" });
  });

  test("missing user returns not found", async () => {
    jest.spyOn(db.User, "findOne").mockResolvedValue(null);
    expect(await userService.getUserDetailAdmin("2")).toMatchObject({ EC: 3, DT: null });
  });
});
