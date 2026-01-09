const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['operator','vendor','customer','admin'], default: 'operator' },
  createdAt: { type: Date, default: Date.now }
});



module.exports = mongoose.model('User', userSchema);