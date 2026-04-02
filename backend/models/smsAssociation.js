const SmsData = require("./smsData");
const Contact = require("./contact");
const Group = require("./group");

// SMS ↔ Contact
SmsData.belongsToMany(Contact, {
  through: "SmsContacts",
  foreignKey: "smsId"
});

Contact.belongsToMany(SmsData, {
  through: "SmsContacts",
  foreignKey: "contactId"
});

// 🔥 SMS ↔ Group (qo‘shamiz)
SmsData.belongsToMany(Group, {
  through: "SmsGroups",
  foreignKey: "smsId"
});

Group.belongsToMany(SmsData, {
  through: "SmsGroups",
  foreignKey: "groupId"
});

module.exports = { SmsData, Contact, Group };