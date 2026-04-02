const express = require("express");
const router = express.Router();
const groupModel = require("../models/group");
const contactModel = require("../models/contact");
const { Group, Contact } = require("../models/association");
const autentication = require("../middlewares/authentication");

router.get("/groupAll", autentication, async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: [
        {
          model: Contact,
          attributes: ["id", "fullName", "phoneNumber", "position"],
          through: { attributes: [] } // 🔥 pivot table ni yashiradi
        }
      ]
    });
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error" });
  }
});
router.post("/createGroup", autentication, async (req, res) => {
  try {
    const group = await groupModel.create(req.body);
    res.status(200).json({ message: "Successfuly created group", data: group });
  } catch (error) {
    console.error(error);

    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      if (field === "groupName") {
        return res.status(400).json({
          message: "Bu group name band",
        });
      }
    }

    // 🔥 DEFAULT ERROR
    return res.status(500).json({
      message: "Server error",
    });
  }
});

router.put("/updateGroup/:id", autentication, async (req, res) => {
  try {
    await groupModel.update(req.body, { where: { id: req.params.id } });
    res.status(200).json({ message: "Group yangilandi" });
  } catch (error) {
    console.error(error);
    if (error.name === "SequelizeUniqueConstraintError") {
      const field = error.errors[0].path;
      if (field === "groupName") {
        return res.status(400).json({
          message: "Bu group name band",
        });
      }
    }

    // 🔥 DEFAULT ERROR
    return res.status(500).json({
      message: "Server error",
    });
  }
});

router.delete("/deleteGroup/:id", autentication, async (req, res) => {
  try {
    await groupModel.destroy({ where: { id: req.params.id } });
    res.status(200).json({ message: "Group deleted" });
  } catch (error) {
    console.error(error);
  }
});

router.post("/addContacts/:groupId", autentication, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { contactIds } = req.body;
    const group = await groupModel.findByPk(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group topilmadi" });
    }
    await group.addContacts(contactIds);
    const contacts = await group.getContacts();
    res.status(200).json({
      message: "Contacts groupga qo'shildi",
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/removeContacts/:groupId", autentication, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { contactIds } = req.body;
    const group = await groupModel.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group topilmadi" });
    }
    await group.removeContacts(contactIds);
    const contacts = await group.getContacts();
    res.status(200).json({
      message: "Contacts groupdan olib tashlandi",
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
