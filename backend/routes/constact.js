const express = require("express");
const router = express.Router();
const contactModel = require("../models/contact");
const autentication = require("../middlewares/authentication");

router.get("/contactAll", autentication, async (req, res) => {
  try {
    const contacts = await contactModel.findAll({raw:true});
   res.status(200).json(contacts)
  } catch (error) {
    console.error(error);
  }
});

router.post("/createContact", autentication, async (req, res) => {
  try {
    const contact = contactModel.build(req.body);
  await contact.save();
    res.status(200).json({ message: "Successfuly created contact" });
  } catch (error) {
    console.error(error);
  }
});

router.put("/updateContact/:id", autentication, async (req, res) => {
  try {
    await contactModel.update(req.body, { where: { id: req.params.id } });
    res.status(200).json({ message: "Conatact yangilandi" });
  } catch (error) {
    console.error(error);
  }
});

router.delete("/deleteContact", autentication, async (req, res) => {
  try {
    await contactModel.destroy({ where: { id: req.query.id } });
    res.status(200).json({ message: "Contact o'chirildi" });
  } catch (error) {
    console.error(error);
  }
});

module.exports=router