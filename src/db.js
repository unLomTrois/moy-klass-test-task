import seq from "sequelize";
const { Sequelize, Model, DataTypes } = seq;

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  define: {
    //prevent sequelize from pluralizing table names
    freezeTableName: true,
    timestamps: false,
    underscored: true,
  },
});

export class LessonStudent extends Model {}
LessonStudent.init(
  {
    lesson_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "lessons",
        key: "id",
      },
    },
    student_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "students",
        key: "id",
      },
    },
    visit: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize: db, modelName: "lesson_students" }
);

export class LessonTeacher extends Model {}
LessonTeacher.init(
  {
    lesson_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "lessons",
        key: "id",
      },
    },
    teacher_id: {
      type: DataTypes.INTEGER,
      references: {
        model: "teachers",
        key: "id",
      },
    },
  },
  { sequelize: db, modelName: "lesson_teachers" }
);

export class Lesson extends Model {}
Lesson.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    title: DataTypes.CHAR(100),
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  { sequelize: db, modelName: "lessons" }
);

export class Teacher extends Model {}
Teacher.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: DataTypes.CHAR(10),
  },
  { sequelize: db, modelName: "teachers" }
);

Lesson.belongsToMany(Teacher, { through: LessonTeacher });
Teacher.belongsToMany(Lesson, { through: LessonTeacher });

export class Student extends Model {}
Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
    name: DataTypes.CHAR(10),
  },
  { sequelize: db, modelName: "students" }
);


Lesson.belongsToMany(Student, { through: LessonStudent });
Student.belongsToMany(Lesson, { through: LessonStudent });

export { db };
