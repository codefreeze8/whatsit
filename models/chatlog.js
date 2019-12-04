var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var chatlogSchema = new Schema({
  room: String,
  message: String,
  attached: String,
  date: { type: Date, default: Date.now },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, justOne: true }
});

var Chatlog = mongoose.model("Chatlog", chatlogSchema);

module.exports = Chatlog;
