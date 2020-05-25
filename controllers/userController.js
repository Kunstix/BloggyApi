const User = require('../models/UserModel');
const Blog = require('../models/BlogModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');
const Factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');

exports.getUsers = Factory.getAll(User);

exports.getProfile = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.getPublicProfile = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username }).select(
    '-photo -hashed_password'
  );

  if (!user) {
    return next(new AppErr('User not found', 400));
  }

  const blogs = await Blog.find({ postedBy: user._id })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select(
      '_id title slug excerpt categories tags postedBy createdAt updatedAt'
    );

  return res.json({
    status: 'success',
    user,
    blogs
  });
});

exports.getPrivateProfile = (req, res) => {
  req.profile.hashed_password = undefined;
  req.profile.salt = undefined;
  return res.json(req.profile);
};

exports.getProfilePhoto = catchAsync(async (req, res, next) => {
  const username = req.params.username;
  const user = await User.findOne({ username });

  if (!user) {
    return next(AppErr('No user found', 400));
  }

  if (user.photo.data) {
    res.set('Content-type', user.photo.contentType);
    return res.send(user.photo.data);
  }

  return res.json({ status: 'success', photo: null });
});

exports.updateProfile = catchAsync(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  const { fields, files } = await new Promise(function (resolve, reject) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return err;
      }
      resolve({ fields, files });
    });
  }).catch(err => {
    next(new AppErr('Photo could not upload', 400));
  });

  fields.role = undefined;
  const user = _.extend(req.profile, fields);
  if (fields.password && fields.password.length < 8) {
    return next(
      new AppErr('Password too short (At least 8 characters.).', 400)
    );
  }

  if (files.photo) {
    if (files.photo.size > 1000000) {
      return next(new AppErr('Image too large. Only up to 1 MB allowed'), 400);
    }
    user.photo.data = fs.readFileSync(files.photo.path);
    user.photo.contentType = files.photo.type;
  }

  const updatedUser = await user.save();
  updatedUser.salt = undefined;
  updatedUser.photo = undefined;
  updatedUser.hashed_password = undefined;
  updatedUser.hashed_password = undefined;

  return res.json({ status: 'success', user: updatedUser });
});

exports.activateUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return next(new AppErr('No valid username', 400));
  }
  const { n, nModified, ok } = await User.updateOne(
    { username },
    { $set: { active: true } }
  );
  if (!n || !nModified || !ok) {
    return next(new AppErr('User could not be updated', 400));
  }
  return res.json({ status: 'success', message: 'User was activated.' });
});

exports.deactivateUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return next(new AppErr('No valid username', 400));
  }
  console.log(username);
  const { n, nModified, ok } = await User.updateOne(
    { username },
    { $set: { active: false } }
  );
  if (!n || !nModified || !ok) {
    return next(new AppErr("User wasn't updated", 400));
  }
  return res.json({ status: 'success', message: 'User was deactivated.' });
});

exports.promoteUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return next(new AppErr('No valid username', 400));
  }
  const { n, nModified, ok } = await User.updateOne(
    { username },
    { $set: { role: 1 } }
  );
  if (!n || !nModified || !ok) {
    return next(new AppErr('User could not be updated', 400));
  }
  return res.json({ status: 'success', message: 'User was promoted.' });
});

exports.demoteUser = catchAsync(async (req, res, next) => {
  const username = req.body.username;
  if (!username) {
    return next(new AppErr('No valid username', 400));
  }
  const { n, nModified, ok } = await User.updateOne(
    { username },
    { $set: { role: 0 } }
  );
  if (!n || !nModified || !ok) {
    return next(new AppErr('User could not be updated', 400));
  }
  return res.json({ status: 'success', message: 'User was demoted.' });
});
