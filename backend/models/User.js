const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  birthDate: {
    type: Date,
    required: true,
  },
  membershipType: {
    type: String,
    enum: ['full', 'partial'],
    default: 'full',
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('User', UserSchema);
