const { Sequelize } = require("sequelize");
require("dotenv").config({ path: __dirname + "/.env" });

const sequelize = new Sequelize(process.env.database, process.env.db_username,process.env.pass, {
      host: "localhost",
      dialect: "postgres",
      logging:false
    });
module.exports=sequelize
