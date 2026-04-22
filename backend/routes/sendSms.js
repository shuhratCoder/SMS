const express = require("express");
const router = express.Router();
const SmsData = require("../models/smsData");
const authentication = require("../middlewares/authentication");
const { Contact, Group } = require("../models/smsAssociation");
const axios = require("axios");

router.post("/send", authentication, async (req, res) => {
  try {
    const { message, contactIds = [], groupIds = [] } = req.body;
    const sms = await SmsData.create({ message });

    // contactlarga
    if (contactIds.length) {
      const contacts = await Contact.findAll({
        where: { id: contactIds },
      });

      const requests = contacts.map((contact) => {
        const phoneNumber = "+" + contact.phoneNumber.replace(/\D/g, "");
        return axios.post(
          "http://192.168.11.3/sendsms.cgi?utf8",
          `[${Number(phoneNumber)}] ${message}`,
          {
            auth: { username: "admin", password: "admin" },
            headers: { "Content-Type": "text/plain" },
            timeout: 3000,
          },
        );
      });

      await Promise.allSettled(requests);

      await sms.addContacts(contactIds);
    }
    // grouplarga 🔥
    if (groupIds.length) {
      const groups = await Group.findAll({
        where: { id: groupIds },
        include: [Contact],
      });

      const groupContacts = groups.flatMap((g) => g.contacts || []);
      const requests = groupContacts.map((contact) => {
              let phone = contact.dataValues.phoneNumber.replace(/\D/g, "");
        phone = "+" + phone;

        return axios.post(
          "http://192.168.11.3/sendsms.cgi?utf8",
          `[${Number(phone)}] ${message}`,
          {
            auth: { username: "admin", password: "admin" },
            headers: { "Content-Type": "text/plain" },
            timeout: 3000,
          },
        );
      });

      await Promise.allSettled(requests);

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
    const date = req.query.date; // ✅ TO‘G‘RI

    const data = await SmsData.findAll({
      include: [
        {
          model: Contact,
          attributes: ["id", "fullName", "phoneNumber"],
          through: { attributes: [] },
        },
        {
          model: Group,
          attributes: ["id", "groupName"],
          through: { attributes: [] },
        },
      ],
    });

    const dataToday = data.filter((sms) => {
      const today = new Date();
      const smsDate = new Date(sms.createdAt);
      return smsDate.toDateString() === today.toDateString();
    });

    const dataMonth = data.filter((sms) => {
      const today = new Date();
      const smsDate = new Date(sms.createdAt);
      return (
        smsDate.getMonth() === today.getMonth() &&
        smsDate.getFullYear() === today.getFullYear()
      );
    });

    if (date === "today") return res.json(dataToday);
    if (date === "month") return res.json(dataMonth);

    return res.json(data); // default = all
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});

module.exports = router;
