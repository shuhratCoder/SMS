const express = require("express");
const cors = require("cors");
const sequelize = require("./db");
const userRouter = require("./routes/user");
const contactRouter=require("./routes/constact")
const groupRouter=require("./routes/group")
const {Contact,Group}=require("./models/association")
const app = express();

app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 2002;

async function start() {
  try {
    await sequelize.authenticate();
    Contact,
    Group
    console.log("Successfuly connect to Postgres");
    app.use("/users", userRouter);
    app.use("/contacts",contactRouter)
    app.use("/groups",groupRouter)
    sequelize
      .sync()
      .then(() => console.log("DB synced"))
      .catch((err) => console.log(err));

    app.listen(PORT, () => {
      console.log(`Server portni ${PORT} ni listen qilyabdi`);
    });
  } catch (error) {
    console.error(error);
  }
}

start();
