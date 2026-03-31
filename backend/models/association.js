const Contact = require("./contact")
const Group=require("./group")

Group.belongsToMany(Contact,{
    through:"GroupContact",
    foreignKey:"groupId"
    
})

Contact.belongsToMany(Group,{
    through:"GroupContact",
    foreignKey:"contactId"
})

module.exports = { Contact, Group }