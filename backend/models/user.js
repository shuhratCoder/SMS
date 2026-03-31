const { DataTypes } = require("sequelize");
const sequelize = require("../db");
require("dotenv").config({ path: __dirname + "/.env" });

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pass: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
