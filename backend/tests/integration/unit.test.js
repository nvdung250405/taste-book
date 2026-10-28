import request from "supertest";
import app from "../../src/server";
import { createJWT } from "../../src/middleware/JWTAction";
import db from "../../src/models/index";

beforeEach(() => {
  jest.spyOn(db.sequelize, "query").mockResolvedValue([[], {}]);
  jest.spyOn(db.sequelize, "transaction").mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() });
});

describe("UC-23: API quản trị đơn vị đo", () => {
  const path = "units";
  const model = "Unit";
  const relation = "RecipeIngredient";
  const body = { unitName: "g" };
  const token = createJWT({ userId: 1, role: "Admin" });
  let record;
  const send = (method, auth = token, data = body) => {
    const requestBuilder = request(app)[method](`/api/v1/admin/${path}${method === "post" ? "" : "/7"}`);
    if (auth) requestBuilder.set("Authorization", `Bearer ${auth}`);
    return requestBuilder.send(data);
  };
  beforeEach(() => {
    record = { id: 7, ...body, defaultUnitId: 1, destroy: jest.fn(), save: jest.fn() };
    jest.spyOn(db.User, "findOne").mockResolvedValue({ id: 1, role: "Admin" });
    jest.spyOn(db[model], "findOne").mockResolvedValue(record);
    jest.spyOn(db[relation], "count").mockResolvedValue(0);
    jest.spyOn(db.Ingredient, "count").mockResolvedValue(0);
    jest.spyOn(db.RecipeIngredient, "update").mockResolvedValue([0]);
  });

  test.each(["post", "put", "delete"])("%s yêu cầu JWT và quyền Admin", async method => {
    expect((await send(method, null)).status).toBe(401);
    db.User.findOne.mockResolvedValue({ id: 1, role: "User" });
    expect((await send(method)).status).toBe(403);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test.each(["post", "put", "delete"])("%s từ chối token role User trước khi xử lý dữ liệu", async method => {
    db.User.findOne.mockResolvedValue({ id: 2, role: "User" });
    const response = await send(method, createJWT({ userId: 2, role: "User" }));
    expect(response.status).toBe(403);
    expect(response.body).toMatchObject({ EC: 4, DT: null });
    expect(db.Unit.findOne).not.toHaveBeenCalled();
    expect(db.sequelize.transaction).not.toHaveBeenCalled();
    expect(record.save).not.toHaveBeenCalled();
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("DELETE đang được công thức sử dụng trả 409", async () => {
    db[relation].count.mockResolvedValue(1);
    const response = await send("delete");
    expect(response.status).toBe(409);
    expect(response.body.EC).toBe(2);
    expect(record.destroy).not.toHaveBeenCalled();
  });

  test("DELETE chưa được sử dụng trả 200", async () => {
    expect((await send("delete")).status).toBe(200);
    expect(record.destroy).toHaveBeenCalled();
  });

  test("DELETE không tồn tại trả 404", async () => {
    db[model].findOne.mockResolvedValue(null);
    expect((await send("delete")).status).toBe(404);
  });

  test("POST tạo dữ liệu và PUT sửa dữ liệu", async () => {
    db[model].findOne.mockResolvedValue(null);
    jest.spyOn(db[model], "create").mockResolvedValue(record);
    expect((await send("post")).status).toBe(201);
    db[model].findOne.mockResolvedValueOnce(record).mockResolvedValueOnce(null);
    expect((await send("put")).status).toBe(200);
    expect(record.save).toHaveBeenCalled();
  });

  test("POST tên sai kiểu trả 400", async () => {
    const name = "unitName";
    expect((await send("post", token, { ...body, [name]: {} })).status).toBe(400);
  });
});

describe("UC-23: GET /api/v1/units", () => {
  beforeEach(() => {
    jest.spyOn(db.Unit, "findAll").mockResolvedValue([{ unitId: 1, unitName: "g" }]);
  });

  test.each([null, "User", "Admin"])("danh sách công khai trả 200 với role %s", async role => {
    const call = request(app).get("/api/v1/units");
    if (role) call.set("Authorization", `Bearer ${createJWT({ userId: 2, role })}`);
    const response = await call;
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ EC: 0, DT: [{ unitId: 1, unitName: "g" }] });
    expect(db.Unit.findAll).toHaveBeenCalledWith({
      attributes: [["id", "unitId"], "unitName"], order: [["id", "ASC"]],
    });
  });

  test("chưa có đơn vị trả danh sách rỗng", async () => {
    db.Unit.findAll.mockResolvedValue([]);
    const response = await request(app).get("/api/v1/units");
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ EC: 0, DT: [] });
  });
});

