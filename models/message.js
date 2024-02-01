const mongoose = require("mongoose");

const { Schema } = mongoose;

const messageSchema = Schema(
  {
    roomId: String,
    author: String,
    authorId: String,
    receiverId: String,
    message: [
      {
        _id: String,
        text: String,
        createdAt: Date,
        user: {
          _id: String,
        },
      },
    ],

    time: String,
  },

  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema, "message");
