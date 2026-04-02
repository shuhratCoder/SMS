const userModel = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authentication = require("../middlewares/authentication");

router.post("/", async (req, res) => {
  try {
    const { username, pass } = req.body;
    const user = await userModel.findAll({ where: { username: username } });
    if (!user.length > 0) {
      return res.status(400).json({ message: "Foydalanuvchi topilmadi" });
    }
    const isMatch = await bcrypt.compare(pass, user[0].dataValues.pass);
    if (!isMatch) {
      return res.status(400).json({ message: "Parol xato" });
    }
    const token = jwt.sign(
      { id: user[0].dataValues.id, username: user[0].dataValues.username },
      process.env.secret,
      {
        expiresIn: "1d",
      },
    );
    res.status(200).json({ token, massage: "Successfuly authentication" });
  } catch (error) {
    console.error(error);
  }
});

router.post("/create", authentication, async (req, res) => {
  try {
    const { username, pass } = req.body;
    const passHash = await bcrypt.hash(pass, 10);
    const user = userModel.build({
      username: username,
      pass: passHash,
    });
    await user.save();
    res.status(200).json({ message: "Successfuly added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server xatoligi" });
  }
});

module.exports = router;
