import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";
import { cloudinary, uploadCloud } from "../../src/config/cloudinary";

// Keep the production Multer parser, file filter and size limit; replace only cloud storage.
jest.mock("multer-storage-cloudinary", () => ({
  CloudinaryStorage: jest.fn().mockImplementation(function () {
    this.uploads = [];
    this._handleFile = jest.fn((req, file, cb) => {
      const chunks = [];
      file.stream.on("data", (chunk) => chunks.push(chunk));
      file.stream.on("error", cb);
      file.stream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        const uploaded = {
          path: "https://res.cloudinary.com/test/image/upload/tastebook_uploads/recipe.png",
          filename: "tastebook_uploads/recipe",
          size: buffer.length,
          buffer,
        };
        this.uploads.push(uploaded);
        cb(null, uploaded);
      });
    });
    this._removeFile = jest.fn((req, file, cb) => cb(null));
  }),
}));

describe("Image API Integration Tests (Upload & Delete)", () => {
  const userToken = createJWT({
    userId: 10,
    email: "user10@example.com",
    role: "User",
  });

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
      jest
        .spyOn(uploadCloud, "single")
        .mockImplementation(() => (req, res, next) => {
          req.file = undefined;
          next();
        });

      const res = await request(app)
        .post("/api/v1/images")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(400);
      expect(res.body.EC).toBe(1);
      expect(res.body.EM).toContain(
        "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB",
      );
    });

    test("báo lỗi 400 khi file vượt quá 5MB hoặc sai định dạng (multer báo lỗi)", async () => {
      jest
        .spyOn(uploadCloud, "single")
        .mockImplementation(() => (req, res, next) => {
          const err = new Error(
            "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
          );
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

      jest
        .spyOn(uploadCloud, "single")
        .mockImplementation(() => (req, res, next) => {
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
      const res = await request(app).delete(
        "/api/v1/images/tastebook_uploads/example",
      );

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

describe("SP4-TASK-05: Image multipart validation with real Multer", () => {
  const image = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
    "base64",
  );
  const storage = uploadCloud.storage;
  const upload = (buffer, filename, contentType) =>
    request(app)
      .post("/api/v1/images")
      .set("Authorization", `Bearer ${createJWT({ userId: 10, role: "User" })}`)
      .attach("file", buffer, { filename, contentType });

  beforeEach(() => {
    storage.uploads = [];
    jest
      .spyOn(db.User, "findOne")
      .mockResolvedValue({ id: 10, role: "User", username: "author" });
  });

  test.each([
    ["recipe.jpg", "image/jpeg"],
    ["recipe.jpeg", "image/jpeg"],
    ["recipe.png", "image/png"],
    ["recipe.webp", "image/webp"],
  ])(
    "accepts multipart %s (%s) and returns the storage URL",
    async (filename, contentType) => {
      const res = await upload(image, filename, contentType);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        EC: 0,
        DT: {
          imageUrl:
            "https://res.cloudinary.com/test/image/upload/tastebook_uploads/recipe.png",
          publicId: "tastebook_uploads/recipe",
        },
      });
      expect(storage._handleFile).toHaveBeenCalledTimes(1);
      expect(storage._handleFile.mock.calls[0][1]).toMatchObject({
        originalname: filename,
        mimetype: contentType,
      });
      expect(storage.uploads[0]).toMatchObject({
        size: image.length,
        buffer: image,
      });
    },
  );

  test.each([
    ["recipe.txt", "text/plain"],
    ["recipe.png", "text/plain"],
    ["recipe.gif", "image/gif"],
    ["recipe.svg", "image/svg+xml"],
  ])(
    "rejects invalid filename/MIME %s (%s) before cloud storage",
    async (filename, contentType) => {
      const res = await upload(image, filename, contentType);
      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ EC: 1, DT: null });
      expect(storage._handleFile).not.toHaveBeenCalled();
    },
  );

  test("accepts a file just below the 5MB limit", async () => {
    const res = await upload(
      Buffer.alloc(5 * 1024 * 1024 - 1),
      "recipe.png",
      "image/png",
    );
    expect(res.status).toBe(201);
    expect(storage.uploads[0].size).toBe(5 * 1024 * 1024 - 1);
  });

  test("rejects a file above 5MB and cleans up the partial upload", async () => {
    const res = await upload(
      Buffer.alloc(5 * 1024 * 1024 + 1),
      "recipe.png",
      "image/png",
    );
    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      EC: 1,
      EM: "File không hợp lệ hoặc vượt quá dung lượng tối đa 5MB!",
      DT: null,
    });
    expect(storage._removeFile).toHaveBeenCalledTimes(1);
  });

  test("rejects multipart without a file", async () => {
    const res = await request(app)
      .post("/api/v1/images")
      .set("Authorization", `Bearer ${createJWT({ userId: 10, role: "User" })}`)
      .field("caption", "Recipe image");
    expect(res.status).toBe(400);
    expect(res.body.EC).toBe(1);
    expect(storage._handleFile).not.toHaveBeenCalled();
  });

  test("rejects upload without authentication before touching storage", async () => {
    const res = await request(app)
      .post("/api/v1/images")
      .attach("file", image, {
        filename: "recipe.png",
        contentType: "image/png",
      });
    expect(res.status).toBe(401);
    expect(res.body.EC).toBe(5);
    expect(storage._handleFile).not.toHaveBeenCalled();
  });

  test("returns a controlled error when cloud storage fails", async () => {
    jest.spyOn(storage, "_handleFile").mockImplementation((req, file, cb) => {
      file.stream.resume();
      cb(new Error("Cloud storage unavailable"));
    });
    const res = await upload(image, "recipe.png", "image/png");
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ EC: 1, DT: null });
  });
});
