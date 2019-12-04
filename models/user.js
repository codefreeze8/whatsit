const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String, trim: true,
    required: "Please give me a username"
  },
  password: { 
    type: String, trim: true,
    validate: [({ length }) => length >= 6, "Password must be 6 characters or more."],
    required: "Please enter a password"
  },
  email: { 
    type: String, trim: true, unique: true, required: true,
    match: [/.{3,}@.{2,}\..{2,}/, "Please enter a valid e-mail address"]
  },
  thumbnail: String,
  tagline: String,
  status: {
    type: String, trim: true, 
    enum : ['online', 'busy', 'away'],
    default: 'online'
  },
  room: String,
  session: { type: String, unique: true }
});


const User = mongoose.model("User", userSchema);

module.exports = User;
