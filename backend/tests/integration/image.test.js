import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import { cloudinary, uploadCloud } from "../../src/config/cloudinary";

describe("Image API Integration Tests (Upload & Delete)", () => {
  const userToken = createJWT({ userId: 10, email: "user10@example.com", role: "User" });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(db.User, "findOne").mockResolvedValue({
      id: 10,
      email: "user10@example.com",
      username: "user10",
      role: "User",
    });
  });

  describe("POST /api/v1/images (Tải lên hình ảnh)", () => {
    test("chặn 401 khi không có token JWT", async () => {
      const res = await request(app).post("/api/v1/images");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
      expect(res.body.EM).toContain("Chưa xác thực");
    });

    test("báo lỗi 400 khi không đính kèm file trong request", async () => {
      // Giả lập middleware multer khi không có file
      jest.spyOn(uploadCloud, "single").mockImplementation(() => (req, res, next) => {
        req.file = undefined;
        next();
      });

      const res = await request(app)
        .post("/api/v1/images")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB");
    });

    test("báo lỗi 400 khi file vượt quá 5MB hoặc sai định dạng (multer báo lỗi)", async () => {
      jest.spyOn(uploadCloud, "single").mockImplementation(() => (req, res, next) => {
        const err = new Error("File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!");
        return res.status(400).json({
          EC: 1,
          EM: err.message,
          DT: null,
        });
      });

      const res = await request(app)
        .post("/api/v1/images")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain("File không hợp lệ");
    });

    test("trả về 201 và link HTTPS khi tải ảnh lên thành công", async () => {
      const mockFile = {
        path: "https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/example.png",
        filename: "tastebook_uploads/example",
      };

      jest.spyOn(uploadCloud, "single").mockImplementation(() => (req, res, next) => {
        req.file = mockFile;
        next();
      });

      const res = await request(app)
        .post("/api/v1/images")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("Tải ảnh lên thành công");
      expect(res.body.DT.imageUrl).toBe(mockFile.path);
      expect(res.body.DT.publicId).toBe(mockFile.filename);
    });
  });

  describe("DELETE /api/v1/images/:publicId (Xóa hình ảnh)", () => {
    test("chặn 401 khi không có token JWT", async () => {
      const res = await request(app).delete("/api/v1/images/tastebook_uploads/example");

      expect(res.status).toBe(401);
      expect(res.body.EC).toBe(5);
    });

    test("trả về 200 khi xóa ảnh thành công khỏi Cloudinary", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "ok",
      });

      const res = await request(app)
        .delete("/api/v1/images/tastebook_uploads/example")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.EC).toBe(0);
      expect(res.body.EM).toContain("Đã xóa ảnh thành công");
    });

    test("báo lỗi 404 khi không tìm thấy ảnh cần xóa trên Cloudinary", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "not found",
      });

      const res = await request(app)
        .delete("/api/v1/images/tastebook_uploads/not_found_file")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.EC).toBe(3);
      expect(res.body.EM).toContain("Không tìm thấy file ảnh cần xóa");
    });
  });
});
