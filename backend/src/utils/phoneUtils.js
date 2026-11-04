// Chuẩn lưu trữ: số di động Việt Nam 10 chữ số bắt đầu bằng 0.
const normalizePhoneNumber = (phone) => {
  if (typeof phone !== "string") return null;
  const clean = phone.trim();
  if (!/^(0|\+84)[35789][0-9]{8}$/.test(clean)) return null;
  return clean.startsWith("+84") ? `0${clean.slice(3)}` : clean;
};

const isPhoneUniqueError = error => error?.name === "SequelizeUniqueConstraintError" &&
  (Object.prototype.hasOwnProperty.call(error.fields || {}, "phone") ||
    error.errors?.some(item => item.path === "phone"));

module.exports = { normalizePhoneNumber, isPhoneUniqueError };
