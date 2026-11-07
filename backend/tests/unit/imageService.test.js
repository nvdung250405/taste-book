import imageService from "../../src/services/imageService";
const { cloudinary } = require("../../src/config/cloudinary");

describe("ImageService Unit Tests (Cloudinary Upload / Delete)", () => {
  const admin = { userId: 1, role: "Admin" };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("uploadImage", () => {
    test("thành công: trả về thông tin ảnh đã upload lên Cloudinary (EC: 0)", () => {
      const mockFile = {
        path: "https://res.cloudinary.com/demo/image/upload/v12345/tastebook_uploads/sample.jpg",
        filename: "tastebook_uploads/sample",
        mimetype: "image/jpeg",
        size: 1024 * 1024,
      };

      const res = imageService.uploadImage(mockFile);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("thành công");
      expect(res.DT.imageUrl).toBe(mockFile.path);
      expect(res.DT.publicId).toBe(mockFile.filename);
    });

    test("thất bại: không có file hoặc file thiếu thuộc tính path (EC: 1)", () => {
      const res = imageService.uploadImage(null);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("File không hợp lệ");
      expect(res.DT).toBeNull();
    });

    test("thất bại: file rỗng không có đường dẫn lưu trữ (EC: 1)", () => {
      const res = imageService.uploadImage({});

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("File không hợp lệ");
    });
  });

  describe("deleteImageByPublicId", () => {
    test.each([undefined, { userId: 10, role: "User" }])(
      "từ chối caller không phải Admin (%j) trước khi gọi Cloudinary (#69)",
      async (user) => {
        const destroy = jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "ok" });
        const res = await imageService.deleteImageByPublicId("tastebook_uploads/sample", user);
        expect(res).toMatchObject({ EC: 4, DT: null });
        expect(destroy).not.toHaveBeenCalled();
      },
    );

    test.each([
      "tastebook_uploads/f1plgomkateq3nufqchm",
      "tastebook_uploads%2Ff1plgomkateq3nufqchm",
      "https://res.cloudinary.com/sf4yjct9/image/upload/v1788611681/tastebook_uploads/f1plgomkateq3nufqchm.png?version=1#avatar",
    ])("Admin cũng không được xóa avatar mặc định: %s (#69)", async (publicId) => {
      const destroy = jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "ok" });
      const res = await imageService.deleteImageByPublicId(publicId, admin);
      expect(res).toMatchObject({ EC: 4, DT: null });
      expect(destroy).not.toHaveBeenCalled();
    });

    test.each([null, 123, {}, "%invalid"])("từ chối publicId không hợp lệ: %j", async (publicId) => {
      const destroy = jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({ result: "ok" });
      const res = await imageService.deleteImageByPublicId(publicId, admin);
      expect(res.EC).toBe(1);
      expect(destroy).not.toHaveBeenCalled();
    });

    test("thành công: xóa ảnh bằng publicId trực tiếp (EC: 0)", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "ok",
      });

      const res = await imageService.deleteImageByPublicId("tastebook_uploads/sample", admin);

      expect(res.EC).toBe(0);
      expect(res.EM).toContain("xóa ảnh thành công");
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("tastebook_uploads/sample", {
        invalidate: true,
      });
    });

    test("thành công: xóa ảnh bằng URL đầy đủ và tự động trích xuất publicId (EC: 0)", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "ok",
      });

      const fullUrl = "https://res.cloudinary.com/demo/image/upload/v12345/tastebook_uploads/photo_123.jpg";
      const res = await imageService.deleteImageByPublicId(fullUrl, admin);

      expect(res.EC).toBe(0);
      expect(cloudinary.uploader.destroy).toHaveBeenCalledWith("tastebook_uploads/photo_123", {
        invalidate: true,
      });
    });

    test("thất bại: mã publicId rỗng (EC: 1)", async () => {
      const res = await imageService.deleteImageByPublicId("   ", admin);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không hợp lệ");
    });

    test("thất bại: không tìm thấy file ảnh trên Cloudinary (EC: 3)", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "not found",
      });

      const res = await imageService.deleteImageByPublicId("tastebook_uploads/non_existing", admin);

      expect(res.EC).toBe(3);
      expect(res.EM).toContain("Không tìm thấy file ảnh");
    });

    test("thất bại: Cloudinary trả về kết quả không hợp lệ (EC: 1)", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockResolvedValue({
        result: "error",
      });

      const res = await imageService.deleteImageByPublicId("invalid-id", admin);

      expect(res.EC).toBe(1);
      expect(res.EM).toContain("không hợp lệ");
    });

    test("thất bại: lỗi kết nối khi gọi Cloudinary SDK (EC: -1)", async () => {
      jest.spyOn(cloudinary.uploader, "destroy").mockRejectedValue(new Error("Cloudinary Error"));

      const res = await imageService.deleteImageByPublicId("tastebook_uploads/sample", admin);

      expect(res.EC).toBe(-1);
      expect(res.EM).toContain("Lỗi kết nối máy chủ");
    });
  });
});
