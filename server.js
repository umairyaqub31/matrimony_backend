const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const dbConnect = require("./database/index");
const ErrorHandler = require("./middlewares/errorHandler");
const { PORT } = require("./config/index");
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const { checkRoom, saveMessage } = require("./services/chatRoom");

app.use(express.json({ limit: "50mb" }));
app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "https://matrimonial-056a82a5ea8f.herokuapp.com/",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    console.log("data....", data);
    checkRoom(data);
    socket.to(data.roomId).emit("receive_message", data);
    saveMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

app.use(userRouter);
app.use(adminRouter);
dbConnect();

app.use(ErrorHandler);

server.listen(PORT, () => {
  console.log("SERVER RUNNING", PORT);
});
