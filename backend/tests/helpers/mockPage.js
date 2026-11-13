// Stub COUNT and SELECT independently, preserving realistic pagination fixtures.
export const mockPage = (model, result) => {
  jest.spyOn(model, "count").mockResolvedValue(result.count);
  return jest.spyOn(model, "findAll").mockResolvedValue(result.rows);
};
