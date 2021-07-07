import express from "express";
import { body, validationResult } from "express-validator";
import moment from "moment";
import seq from "sequelize";
const { Op } = seq;

import {
  db,
  Lesson,
  LessonStudent,
  LessonTeacher,
  Student,
  Teacher,
} from "./db.js";

const app = express();
const port = 3000;

app.use(express.json());

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

app.post(
  "/lessons",
  body("title").isString(),
  body("teacher_ids").isArray(),
  body("days").isArray(),
  body("first_date").isDate(),
  body("lessons_count").isInt({ min: 1, max: 300 }).optional(),
  body("last_date").isDate().optional(),
  async (req, res) => {
    const { title, teacher_ids, days, lessons_count, last_date } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (lessons_count !== undefined && last_date !== undefined) {
      return res
        .status(400)
        .json({ errors: "both last_date andd lesson_count exists" });
    }

    const first_date = moment(req.body.first_date);
    days.sort();

    const lessons_count_limit = 300;
    const year_limit = 1;

    const dates = [];
    const first_date_weekday = first_date.day();
    if (lessons_count !== undefined) {
      let created_lessons = 0;
      let i = days.indexOf(first_date_weekday); // week day index
      let j = 0; // week index
      while (created_lessons != lessons_count) {
        if (days[i] === undefined) {
          i = 0;
        }
        const week_day = days[i];
        const date = first_date
          .clone()
          .day(week_day + j)
          .utc(true);
        if (
          dates.length == lessons_count_limit ||
          date.isAfter(first_date.clone().add(year_limit, "year"))
        ) {
          break;
        }
        dates.push(date);

        created_lessons++;
        if (week_day == days[days.length - 1]) {
          j += 7;
        }
        i++;
      }
    } else if (last_date !== undefined) {
      let i = days.indexOf(first_date_weekday); // week day index
      let j = 0;
      let date = first_date.clone();
      while (date.isBefore(last_date)) {
        if (days[i] === undefined) {
          i = 0;
        }
        const week_day = days[i];
        date = first_date
          .clone()
          .day(week_day + j)
          .utc(true);
        if (
          dates.length == lessons_count_limit ||
          date.isAfter(first_date.clone().add(year_limit, "year"))
        ) {
          break;
        }
        dates.push(date);

        if (week_day == days[days.length - 1]) {
          j += 7;
        }
        i++;
      }
    }

    const filtered_dates = dates.filter((date) => date.isAfter(first_date));

    const new_lesson_ids = [];
    for (const date of filtered_dates) {
      const new_lesson = await Lesson.create({ date: date.toDate(), title });

      for (const teacher_id of teacher_ids) {
        await LessonTeacher.create({
          lesson_id: new_lesson.id,
          teacher_id
        });
      }

      new_lesson_ids.push(new_lesson.id);
    }

    res.send(new_lesson_ids);
  }
);

app.listen(port, async () => {
  // await db.sync();
  console.log(`Example app listening at http://localhost:${port}`);
});
