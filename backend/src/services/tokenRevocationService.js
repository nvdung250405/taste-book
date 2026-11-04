import { createHash } from "node:crypto";
import { Op } from "sequelize";
import db from "../models/index";

const hashToken = token => createHash("sha256").update(token).digest("hex");

// Hash cả JWT để hỗ trợ cả token cũ chưa có jti; không lưu JWT gốc.
const isTokenRevoked = async token => Boolean(await db.RevokedToken.findByPk(hashToken(token)));

// claims phải được xác minh chữ ký và hạn trước khi gọi.
const revokeToken = async (token, claims) => db.RevokedToken.findOrCreate({
  where: { tokenHash: hashToken(token) },
  defaults: {
    jti: claims.jti || null,
    userId: claims.userId || claims.id,
    expiresAt: new Date(claims.exp * 1000),
  },
});

const cleanupExpiredTokens = async () => db.RevokedToken.destroy({
  where: { expiresAt: { [Op.lte]: new Date() } },
});

const startTokenCleanup = () => {
  const cleanup = () => cleanupExpiredTokens().catch(error => console.error("Token cleanup failed:", error));
  void cleanup();
  const timer = setInterval(cleanup, 60 * 60 * 1000);
  timer.unref();
  return timer;
};

export { isTokenRevoked, revokeToken, cleanupExpiredTokens, startTokenCleanup };
