const { DataTypes } = require("sequelize");
const sequelize = require("../db");
require("dotenv").config({ path: __dirname + "/.env" });

const Contact = sequelize.define("contact", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  fullName: { type: DataTypes.STRING, allowNull: false, unique: true },
  phoneNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  position: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Contact;
