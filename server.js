const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const dbConnect = require("./database/index");
const ErrorHandler = require("./middlewares/errorHandler");
const { PORT } = require("./config/index");
app.use(express.json({ limit: "50mb" }));

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

app.use(userRouter);
app.use(adminRouter);

dbConnect();
app.use(ErrorHandler);
app.listen(PORT, () => {
  console.log("server running")
});