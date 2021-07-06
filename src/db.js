import seq from 'sequelize';
const { Sequelize, Model, DataTypes } = seq;

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
});

export { db }