const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      max: 32,
      trim: true,
      lowercase: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      max: 32,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    profile: {
      type: String,
      required: true
    },
    photo: {
      data: Buffer,
      contentType: String
    },
    role: {
      type: Number,
      default: 0
    },
    hashed_password: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: true
    },
    about: {
      type: String
    },
    resetPasswordLink: {
      data: String,
      default: ''
    }
  },
  { timestamps: true }
);

userSchema.virtual('password').set(function (password) {
  this.hashed_password = this.encryptPassword(password);
});

userSchema.methods = {
  authenticate: function (plainPassword) {
    return bcrypt.compareSync(plainPassword, this.hashed_password);
  },
  encryptPassword: function (password) {
    if (!password) return '';
    try {
      return bcrypt.hashSync(password, 12);
    } catch (err) {
      return '';
    }
  }
};

module.exports = mongoose.model('User', userSchema);
