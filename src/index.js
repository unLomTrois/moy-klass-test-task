import express from "express";
import {
  db,
  Lesson,
  LessonStudent,
  LessonTeacher,
  Student,
  Teacher,
} from "./db.js";
import seq from "sequelize";
const { Op } = seq;

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const lessons_per_page = parseInt(req.query.lessons_per_page ?? 5);
  const page = parseInt(req.query.page ?? 0) * lessons_per_page;

  if (page < 0) {
    res.status(400);
    res.send({
      error: "negative page",
    });
    return;
  }

  const status = req.query.status;

  const dates = req.query.date
    ?.split(",")
    .map((d) => new Date(d))
    .filter((d) => d instanceof Date && !isNaN(d));

  const teacher_ids = req.query.teacher_ids
    ?.split(",")
    .map((id) => parseInt(id));

  // массив id уроков с перечисоенными учителями
  let lesson_ids_with_teachers = [];
  if (teacher_ids !== undefined) {
    lesson_ids_with_teachers = (
      await LessonTeacher.findAll({
        where: {
          teacher_id: {
            [Op.in]: teacher_ids ?? [],
          },
        },
      })
    ).map((lesson) => lesson.lesson_id);
  }

  const students_count = req.query.students_count
    ?.split(",")
    .map((num) => parseInt(num));

  // массив id уроков с определённым количеством учеников
  let lesson_ids_with_student_count = [];
  if (students_count !== undefined) {
    lesson_ids_with_student_count = (
      await LessonStudent.findAll({
        attributes: ["lesson_id"],
        group: ["lesson_id"],
        having:
          students_count == undefined
            ? seq.literal("COUNT(student_id) = 999")
            : students_count?.length == 2
            ? seq.literal(
                `COUNT(student_id) between ${students_count[0]} and ${students_count[1]}`
              )
            : seq.literal(`COUNT(student_id) = ${students_count[0]}`),
      })
    ).map((group) => group.lesson_id);
  }

  // массив допустимых id
  const united_ids_arr = lesson_ids_with_student_count.filter((value) =>
    lesson_ids_with_teachers.includes(value)
  );

  // запрос к бд
  const where = {
    ...(status == undefined ? {} : { status }),
    ...(dates == undefined
      ? {}
      : {
          date: {
            [Op.or]: {
              [Op.between]: dates,
              [Op.eq]: dates[0],
            },
          },
        }),
    ...(teacher_ids == undefined
      ? {}
      : {
          id: {
            [Op.in]: united_ids_arr.length
              ? united_ids_arr
              : lesson_ids_with_teachers,
          },
        }),
    ...(students_count == undefined
      ? {}
      : {
          id: {
            [Op.in]: united_ids_arr.length
              ? united_ids_arr
              : lesson_ids_with_student_count,
          },
        }),
  };

  const lessons = (
    await Lesson.findAll({
      where,
      limit: lessons_per_page,
      offset: page,
      include: [
        {
          model: Teacher,
          through: {
            attributes: [],
          },
        },
        {
          model: Student,
          through: {
            as: "lesson",
            attributes: ["visit"],
          },
        },
      ],
      order: [["date"]],
    })
  ).map((lesson) => {
    const visit_count = lesson.students
      .map((student) => student.lesson.visit)
      .reduce((acc, value) => (acc += value), 0);

    lesson.setDataValue("visit_count", visit_count);

    return lesson;
  });

  res.send(lessons);
});

app.get("/lessons");

app.listen(port, async () => {
  // await db.sync();
  console.log(`Example app listening at http://localhost:${port}`);
});
