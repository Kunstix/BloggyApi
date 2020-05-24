const catchAsync = require('../utils/catchAsync');
const Tag = require('../models/TagModel');
const Blog = require('../models/BlogModel');
const Factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const slugify = require('slugify');

const defaultPopOptions = [
  {
    path: 'categories',
    select: '_id name slug'
  },
  {
    path: 'tags',
    select: '_id name slug'
  },
  {
    path: 'postedBy',
    select: '_id name username'
  }
];

exports.getTag = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const tag = await Tag.findOne({ slug });

  const features = new APIFeatures(Blog.find({ tags: tag }), req.query)
    .paginate()
    .sort();

  const query = features.query
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select(
      '_id title slug excerpt categories postedBy tags createdAt updatedAt'
    );
  const data = await query;
  res.json({
    status: 'success',
    tag,
    size: data.length,
    blogs: data
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
