const User = require('../models/UserModel');
const catchAsync = require('../utils/catchAsync');
const AppErr = require('../utils/appError');
const Category = require('../models/CategoryModel');
const slugify = require('slugify');

exports.getCategory = catchAsync(async (req, res) => {
  const slug = req.params.slug.toLowerCase();
  const data = await Category.findOne({ slug });
  res.json({
    status: 'success',
    data
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
  await Category.deleteOne({ slug });
  res.json({
    status: 'success',
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
