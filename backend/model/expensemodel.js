const Sequelize = require("sequelize");

const sequelize = require("../config/database");

const User = sequelize.define("expense", {
  id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  date: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  amount: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  category: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  income: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  expense: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

module.exports = User;
