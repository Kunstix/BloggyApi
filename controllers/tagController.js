const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const Tag = require('../models/TagModel');
const slugify = require('slugify');

exports.getTag = catchAsync(async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const data = await Tag.findOne({ slug });
  res.json({
    status: 'success',
    data
  });
});

exports.createTag = catchAsync(async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  const tag = new Tag({ name, slug });

  const data = await tag.save();
  res.json({
    status: 'success',
    data
  });
});

exports.deleteTag = catchAsync(async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  await Tag.deleteOne({ slug });
  res.json({
    status: 'success',
    message: 'Tag deleted successfully.'
  });
});

exports.getAllTags = catchAsync(async (req, res) => {
  const data = await Tag.find({});
  res.json({
    status: 'success',
    size: data.length,
    data
  });
});
