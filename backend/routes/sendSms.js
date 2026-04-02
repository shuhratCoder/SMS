const express = require("express");
const router = express.Router();
const SmsData = require("../models/smsData");
const authentication = require("../middlewares/authentication");
const { Contact, Group } = require("../models/smsAssociation");


router.post("/send", authentication, async (req, res) => {
  try {
    const { message, contactIds = [], groupIds = [] } = req.body;
console.log(req.body);

    const sms = await SmsData.create({ message });

    // contactlarga
    if (contactIds.length) {
      await sms.addContacts(contactIds);
    }

    // grouplarga 🔥
    if (groupIds.length) {
      await sms.addGroups(groupIds);
    }

    res.json({ message: "SMS yuborildi" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

router.get("/history", async (req, res) => {
  try {
    const data = await SmsData.findAll({
      include: [
        {
          model: Contact,
          attributes: ["id", "fullName", "phoneNumber"],
          through: { attributes: [] }
        },
        {
          model: Group,
          attributes: ["id", "groupName"],
          through: { attributes: [] }
        }
      ]
    });

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;