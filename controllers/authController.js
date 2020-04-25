const shortid = require('shortid');
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const User = require('../models/UserModel');

exports.signup = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).json({
      status: 'fail',
      error: 'Email is already signed up.'
    });
  }
  const { name, email, password } = req.body;
  const username = shortid.generate();
  const profile = `${process.env.CLIENT_URL}/profile/${username}`;
  const newUser = new User({ username, name, email, password, profile });

  try {
    await newUser.save();
  } catch (error) {
    return res.status(400).json({
      status: 'fail',
      error
    });
  }

  return res.json({
    status: 'success',
    message: 'Signed up successfully! Please login.'
  });
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        error: 'Email is not registered.'
      });
    }

    if (!user.authenticate(password)) {
      return res.status(400).json({
        status: 'fail',
        error: 'Wrong password.'
      });
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
  } catch (err) {
    return res.status(400).json({
      status: 'fail',
      error: err.message
    });
  }
};

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
