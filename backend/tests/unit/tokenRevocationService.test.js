import { Op } from "sequelize";
import db from "../../src/models/index";
import { cleanupExpiredTokens, isTokenRevoked, startTokenCleanup } from "../../src/services/tokenRevocationService";

describe("#128: lưu thu hồi trong DB và dọn token hết hạn", () => {
  test("mỗi lần xác thực đọc lại DB, không giữ cache thu hồi trong tiến trình", async () => {
    db.RevokedToken.findByPk.mockResolvedValueOnce(null).mockResolvedValueOnce({ tokenHash: "stored" });
    expect(await isTokenRevoked("same-token")).toBe(false);
    expect(await isTokenRevoked("same-token")).toBe(true);
    expect(db.RevokedToken.findByPk).toHaveBeenCalledTimes(2);
  });

  test("chỉ xóa bản ghi có expiresAt <= hiện tại", async () => {
    jest.spyOn(db.RevokedToken, "destroy").mockResolvedValue(2);
    const start = Date.now();
    expect(await cleanupExpiredTokens()).toBe(2);
    const cutoff = db.RevokedToken.destroy.mock.calls[0][0].where.expiresAt[Op.lte];
    expect(cutoff.getTime()).toBeGreaterThanOrEqual(start);
    expect(cutoff.getTime()).toBeLessThanOrEqual(Date.now());
  });

  test("dọn lúc khởi động và mỗi giờ; lỗi dọn không dừng lịch", async () => {
    jest.useFakeTimers();
    const log = jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(db.RevokedToken, "destroy").mockRejectedValueOnce(new Error("DB down")).mockResolvedValue(0);
    let timer;
    try {
      timer = startTokenCleanup();
      await jest.advanceTimersByTimeAsync(60 * 60 * 1000);
      expect(db.RevokedToken.destroy).toHaveBeenCalledTimes(2);
      expect(log).toHaveBeenCalledTimes(1);
    } finally {
      clearInterval(timer);
      jest.useRealTimers();
    }
  });
});
