var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatroomSchema = new Schema({
  room: { type: String, trim: true, unique: true,
    required: "Please name the chatroom" },
  date: { type: Date, default: Date.now }
});

var Chatroom = mongoose.model("Chatroom", chatroomSchema);

module.exports = Chatroom;
