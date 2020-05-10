const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return next(new AppErr('Email is already signed up.', 400));
  }
  const { name, email, password } = req.body;
  const username = shortid.generate();
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;
  const newUser = new User({ username, name, email, password, profile });

  await newUser.save();

  return res.json({
    status: 'success',
    message: 'Signed up successfully! Please login.'
  });
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppErr('Email is not registered.', 400));
  }

  if (!user.authenticate(password)) {
    return next(new AppErr('Wrong password.', 400));
  }

  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1d'
  });

  res.cookie('jwt', token, { expiresIn: '1d' });
  const { _id, username, name, role } = user;
  return res.json({
    status: 'success',
    token,
    user: { _id, username, name, email, role }
  });
});

exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.json({
    status: 'success',
    message: 'Logged out successfully.'
  });
};

exports.isLoggedIn = expressJwt({
  secret: process.env.JWT_SECRET
});
