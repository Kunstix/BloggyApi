const catchAsync = require('../utils/catchAsync');
const Tag = require('../models/TagModel');
const Blog = require('../models/BlogModel');
const slugify = require('slugify');

exports.getTag = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const tag = await Tag.findOne({ slug });

  const data = await Blog.find({ tags: tag })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name')
    .select(
      '_id title slug excerpt categories postedBy tags createdAt updatedAt'
    );
  res.json({
    status: 'success',
    tag,
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
