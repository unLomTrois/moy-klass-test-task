import request from "supertest";
import { app } from "../src/app.js";

import { every, isArray, isEqual, sortBy } from "lodash-es";
import { db } from "../src/db.js";

describe("Тестирование корневого метода", () => {
  beforeAll(async () => {
    await db.sync();
  });

  test("Ответ должен быть положительным", async () => {
    const response = await request(app).get("/");
    expect(response.statusCode).toBe(200);
  });
  test("Ответ должен быть массивом", async () => {
    const response = await request(app).get("/");
    expect(isArray(response.body)).toBe(true);
  });
  test("Тест на пагинацию: page", async () => {
    const response_first_page = await (await request(app).get("/?page=0")).body;
    const response_second_page = await (
      await request(app).get("/?page=1")
    ).body;

    const response_error = await request(app).get("/?page='--'");

    expect(
      isEqual(sortBy(response_first_page), sortBy(response_second_page))
    ).toBe(false);
    expect(response_error.statusCode).toBe(400);
  });
  test("Тест на пагинацию: lessons_per_page", async () => {
    const response = await (
      await request(app).get("/?lessons_per_page=5")
    ).body;
    const response_lesson_per_page = await (
      await request(app).get("/?lessons_per_page=10")
    ).body;

    expect(isEqual(sortBy(response), sortBy(response_lesson_per_page))).toBe(
      false
    );
  });
  test("Тест на фильтрацию: status", async () => {
    const response = await (await request(app).get("/?status=0")).body;

    const response_status = await (await request(app).get("/?status=1")).body;

    expect(isEqual(sortBy(response), sortBy(response_status))).toBe(false);
  });
  test("Тест на фильтрацию: dates", async () => {
    const response = await (
      await request(app).get("/?date=2019-01-01,2019-05-01")
    ).body;

    const response_dates = await (
      await request(app).get("/?date=2019-06-01,2019-09-01")
    ).body;

    expect(isEqual(sortBy(response), sortBy(response_dates))).toBe(false);
  });
  test("Тест на фильтрацию: students_count", async () => {
    const response = await (
      await request(app).get("/?students_count=1,2")
    ).body;

    const response_students_count = await (
      await request(app).get("/?students_count=3,4")
    ).body;

    expect(isEqual(sortBy(response), sortBy(response_students_count))).toBe(
      false
    );
  });
  test("Тест на фильтрацию: teacher_ids", async () => {
    const response = await (await request(app).get("/?teacher_ids=1, 2")).body;

    const response_teacher_ids = await (
      await request(app).get("/?teacher_ids=3,4")
    ).body;

    expect(isEqual(sortBy(response), sortBy(response_teacher_ids))).toBe(false);
  });
});

describe("Тестирование метода /lessons", () => {
  beforeAll(async () => {
    await db.sync();
  });

  test("Создание новых занятий", async () => {
    const data = (
      await request(app)
        .post("/lessons")
        .send({
          title: "test",
          first_date: "2021-07-07",
          teacher_ids: [1, 2],
          days: [1],
          lessons_count: 3,
        })
    ).body;

    expect(every(data, Number)).toBe(true);
    expect(data.length).toBe(3);
  });
});
