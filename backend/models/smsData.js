const {DataTypes} = require("sequelize");
const sequelize = require("../db");

const SmsData = sequelize.define("smsData",{
    id:{
        type:DataTypes.UUID,
        defaultValue:DataTypes.UUIDV4,
        primaryKey:true
    },
    message:{
        type:DataTypes.STRING,
        allowNull:false
    }
});
module.exports = SmsData;