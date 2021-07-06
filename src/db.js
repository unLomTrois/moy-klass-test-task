import seq from 'sequelize';
const { Sequelize, Model, DataTypes } = seq;

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  define: {
    //prevent sequelize from pluralizing table names
    freezeTableName: true,
    timestamps: false
  }
});

export class LessonStudent extends Model { }
LessonStudent.init({
  lesson_id: DataTypes.INTEGER,
  student_id: DataTypes.STRING,
  visit: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, { sequelize: db, modelName: 'lesson_students' });

export class LessonTeacher extends Model { }
LessonTeacher.init({
  lesson_id: DataTypes.INTEGER,
  teacher_id: DataTypes.STRING,
}, { sequelize: db, modelName: 'lesson_teachers' });


export class Lesson extends Model { }
Lesson.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  title: DataTypes.CHAR(100),
  status: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
}, { sequelize: db, modelName: 'lessons' });

export class Student extends Model { }
Student.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  name: DataTypes.CHAR(10)
}, { sequelize: db, modelName: 'students' });


export class Teacher extends Model { }
Teacher.init({
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true

  },
  name: DataTypes.CHAR(10)
}, { sequelize: db, modelName: 'teachers' });

export { db }