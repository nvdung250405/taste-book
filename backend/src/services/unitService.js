const QUALITATIVE_UNITS = ["vừa đủ", "tùy khẩu vị", "vừa vừa", "nêm nếm"];

const isQualitativeUnit = (unitName) =>
  QUALITATIVE_UNITS.includes(
    String(unitName || "")
      .normalize("NFC")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase(),
  );

module.exports = {
  isQualitativeUnit,
};
