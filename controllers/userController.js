const User = require('../models/UserModel');
const Blog = require('../models/BlogModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const formidable = require('formidable');
const fs = require('fs');
const _ = require('lodash');

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
    .limit(10)
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
