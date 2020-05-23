const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const Blog = require('../models/BlogModel');
const mail = require('@sendgrid/mail');
const _ = require('lodash');
mail.setApiKey(process.env.EMAIL_KEY);

exports.preSignup = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(new AppErr('Email is already signed up.', 400));
  }

  const token = jwt.sign(
    { name, email, password },
    process.env.JWT_SIGNUP_SECRET,
    {
      expiresIn: '10m'
    }
  );

  // Send email with token
  const emailData = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: ` ${process.env.APP_NAME} - Account Activation`,
    html: `<h4>Please click the following link to activate your account:</h4>
         <a href="${process.env.CLIENT_URL}/signup/account/${token}">Activate Your Account </a>
         <hr />
         <p>You can ignore this email if you didn\'t signup for us.</p>
         <p>https://bloggy.com</p>
         `
  };
  await mail.send(emailData);

  return res.json({
    status: 'success',
    message: `Email has been sent to ${email}. Please activate your account!`
  });
});

exports.signupWithUser = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(new AppErr('Email is already signed up.', 400));
  }
  const username = shortid.generate();
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;
  const newUser = new User({ username, name, email, password, profile });

  await newUser.save();

  return res.json({
    status: 'success',
    message: 'Signed up successfully! Please login.'
  });
});

exports.signup = catchAsync(async (req, res, next) => {
  const token = req.body.token;
  if (token) {
    await jwt.verify(token, process.env.JWT_SIGNUP_SECRET);

    const { name, email, password } = jwt.decode(token);

    const username = shortid.generate();
    const profile = `${process.env.CLIENT_URL}/profile/${username}`;

    const user = new User({ name, email, password, profile, username });
    await user.save();

    return res.json({
      status: 'success',
      message: 'Signed up successfully! Please login.'
    });
  } else {
    return next(new AppErr('Please signup again.'));
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppErr('Email is not registered.', 401));
  }

  if (!user.authenticate(password)) {
    return next(new AppErr('Wrong password.', 401));
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

exports.checkToken = expressJwt({
  secret: process.env.JWT_SECRET
});

exports.restrictedToUser = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const user = await User.findById({ _id: userId });
  if (!user) {
    return next(AppErr('User not found.', 400));
  }
  req.profile = user;
  next();
});

exports.restrictedToAdmin = catchAsync(async (req, res, next) => {
  const adminId = req.user._id;
  const admin = await User.findById({ _id: adminId });
  if (!admin) {
    return next(new AppErr('User not found.', 400));
  }

  if (admin.role !== 1) {
    return next(new AppErr('Access denied.', 403));
  }
  req.profile = admin;
  next();
});

exports.restrictedToMe = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const blog = await Blog.findOne({ slug });

  const authorizedUser =
    blog.postedBy._id.toString() === req.profile._id.toString();

  if (!authorizedUser) {
    return next(new AppErr('Access denied.', 403));
  }
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppErr('User with that email does not exist.', 401));
  }

  // Generate reset token
  const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_SECRET, {
    expiresIn: '10m'
  });

  // Populate Db with token
  await user.updateOne({ resetPasswordLink: token });

  // Send email with token
  const emailData = {
    to: email,
    from: process.env.EMAIL_FROM,
    subject: ` ${process.env.APP_NAME} - Reset Password`,
    html: `<h4>Please click the following link to reset your password:</h4>
         <a href="${process.env.CLIENT_URL}/password/reset/${token}">Reset Password </a>
         <hr />
         <p>https://bloggy.com</p>
         `
  };
  await mail.send(emailData);

  return res.json({
    status: 'success',
    message: `Email has been send to ${email}.\nReset link expires in 10 minutes.`
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetPasswordLink, password } = req.body;

  if (!resetPasswordLink) {
    return next(new AppErr('No valid reset token found.'), 400);
  }

  const decoded = await jwt.verify(
    resetPasswordLink,
    process.env.JWT_RESET_SECRET
  );

  const user = await User.findOne({ resetPasswordLink });

  if (!user) {
    return next(new AppErr('No user found.'), 401);
  }

  const updatedUser = _.extend(user, {
    password,
    resetPasswordLink: ''
  });

  await updatedUser.save();

  return res.json({
    status: 'success',
    message: 'Password was updated.'
  });
});
