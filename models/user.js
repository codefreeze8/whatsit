const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  birthday: Date,
  thumbnail: String,
  room: String,
  session: { type: String, unique: true }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
