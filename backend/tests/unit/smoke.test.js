describe("Jest Environment Smoke Test", () => {
  test("should pass basic math assertion", () => {
    expect(1 + 1).toBe(2);
  });

  test("should support ES6 syntax and async/await", async () => {
    const sampleData = { EC: 0, EM: "Thành công!", DT: { status: "active" } };
    const fetchData = async () => Promise.resolve(sampleData);
    const result = await fetchData();
    expect(result.EC).toBe(0);
    expect(result.DT.status).toBe("active");
  });
});
