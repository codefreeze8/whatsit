var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatSchema = new Schema({
  room: String,
  message: String,
  image: String,
  date: { type: Date, default: Date.now },
  userId: { type: Schema.Types.ObjectId, ref: 'User' }
});

var Chat = mongoose.model("Chat", chatSchema);

module.exports = Chat;
