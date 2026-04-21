const { DataTypes } = require("sequelize");
const sequelize = require("../db");
require("dotenv").config({ path: __dirname + "/.env" });

const Group = sequelize.define("group", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  groupName: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  lastUsed: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

module.exports = Group;
