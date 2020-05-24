const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const Category = require('../models/CategoryModel');
const Blog = require('../models/BlogModel');
const APIFeatures = require('../utils/apiFeatures');
const slugify = require('slugify');

exports.getCategory = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const category = await Category.findOne({ slug });

  const features = new APIFeatures(
    Blog.find({ categories: category }),
    req.query
  )
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
    category,
    size: data.length,
    blogs: data
  });
});

exports.createCategory = catchAsync(async (req, res) => {
  const { name } = req.body;
  const slug = slugify(name).toLowerCase();
  const category = new Category({ name, slug });

  const data = await category.save();
  res.json({
    status: 'success',
    data
  });
});

exports.deleteCategory = catchAsync(async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const { deletedCount } = await Category.deleteOne({ slug });
  res.json({
    status: 'success',
    deletedCount,
    message: 'Category deleted successfully.'
  });
});

exports.getAllCategories = catchAsync(async (req, res) => {
  const data = await Category.find({});
  res.json({
    status: 'success',
    size: data.length,
    data
  });
});
