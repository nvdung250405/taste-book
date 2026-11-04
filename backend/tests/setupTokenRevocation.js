// Các bộ test API hiện có mock DB. Mặc định token chưa bị thu hồi;
// các test #128 ghi đè mock này để kiểm tra dữ liệu thu hồi thật qua service.
beforeEach(() => {
  const db = require("../src/models/index");
  if (db.RevokedToken) jest.spyOn(db.RevokedToken, "findByPk").mockResolvedValue(null);
});
