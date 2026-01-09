const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  mobile: {
    type: String,
    unique: true,
    trim: true
  },
  country: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


// Export safely (prevents overwrite errors)
module.exports =
  mongoose.models.Customer || mongoose.model('Customer', customerSchema);