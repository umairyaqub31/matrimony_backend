const express = require("express");
const app = express();
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const dbConnect = require("./database/index");
const ErrorHandler = require("./middlewares/errorHandler");
const { PORT } = require("./config/index");
app.use(express.json({ limit: "50mb" }));
const http = require("http");
const server = http.createServer(app);

const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");

app.use(userRouter);
app.use(adminRouter);

dbConnect();

const io = new Server(server);

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log("data....", data);
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});
app.use(ErrorHandler);
app.listen(PORT, () => {
  console.log("server running", PORT);
});
