const fs = require('fs');
const formidable = require('formidable');
const slugify = require('slugify');
const _ = require('lodash');
const stripHtml = require('string-strip-html');
const Blog = require('../models/BlogModel');
const Category = require('../models/CategoryModel');
const Tag = require('../models/TagModel');
const AppErr = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { smartTrim } = require('../utils/blogUtil');

exports.getBlog = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const data = await Blog.findOne({ slug })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select(
      '_id title slug mtitle mdesc excerpt categories tags postedBy createdAt updatedAt'
    );
  res.json({
    status: 'success',
    data
  });
});

exports.updateBlog = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const blog = await Blog.findOne({ slug });

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
    next(new AppErr('Image could not upload', 400));
  });

  const oldSlug = blog.slug;
  const updatedBlog = _.merge(blog, fields);
  updatedBlog.slug = oldSlug;

  const { body, categories, tags } = fields;

  if (body) {
    updatedBlog.excerpt = smartTrim(body, 320, ' ', ' ...');
    updatedBlog.mdesc = stripHtml(body.substring(0, 160));
  }

  if (categories) {
    updatedBlog.categories = categories.split(',');
  }

  if (tags) {
    updatedBlog.tags = tags.split(',');
  }

  if (files.photo) {
    if (files.photo.size > 1000000) {
      return next(new AppErr('Image too large. Only up to 1 MB allowed'), 400);
    }
    updatedBlog.photo.data = fs.readFileSync(files.photo.path);
    updatedBlog.photo.contentType = files.photo.type;
  }

  const data = await updatedBlog.save();
  return res.json({
    status: 'success',
    data
  });
});

exports.createBlog = catchAsync(async (req, res, next) => {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  const { title, body, categories, tags, files } = await new Promise(function (
    resolve,
    reject
  ) {
    form.parse(req, function (err, fields, files) {
      if (err) {
        reject(err);
        return err;
      }
      resolve({ ...fields, files });
    });
  }).catch(err => {
    next(new AppErr('Image could not upload', 400));
  });

  if (!title || !title.length) {
    return next(new AppErr('Title is required.', 400));
  }

  if (!body || body.length < 100) {
    return next(new AppErr('Content too short.', 400));
  }

  if (!categories || !categories.length) {
    return next(new AppErr('At least one category is required.', 400));
  }

  if (!tags || !tags.length) {
    return next(new AppErr('At least one tag is required.', 400));
  }

  // CREATE BLOG
  const blog = new Blog();
  blog.title = title;
  blog.body = body;
  blog.slug = slugify(title).toLowerCase();
  blog.excerpt = smartTrim(body, 320, ' ', ' ...');
  blog.mtitle = `${title} | ${process.env.APP_NAME}`;
  blog.mdesc = stripHtml(body.substring(0, 160));
  blog.postedBy = req.user._id;
  blog.categories = categories.split(',');
  blog.tags = tags.split(',');

  // FILES
  if (files.photo) {
    if (files.photo.size > 1000000) {
      return next(new AppErr('Image too large. Only up to 1 MB allowed'), 400);
    }
    blog.photo.data = fs.readFileSync(files.photo.path);
    blog.photo.contentType = files.photo.type;
  }

  const data = await blog.save();
  return res.json({
    status: 'success',
    data
  });
});

exports.deleteBlog = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  await Blog.deleteOne({ slug });
  res.json({
    status: 'success',
    message: 'Blog deleted successfully.'
  });
});

exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const data = await Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select(
      '_id title slug excerpt categories tags postedBy createdAt updatedAt'
    );
  res.json({
    status: 'success',
    size: data.length,
    data
  });
});

exports.getAll = catchAsync(async (req, res, next) => {
  const limit = req.body.limit ? parseInt(req.body.limit) : 10;
  const skip = req.body.skip ? parseInt(req.body.skip) : 0;

  const blogs = await Blog.find({})
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select(
      '_id title slug excerpt categories tags postedBy createdAt updatedAt'
    );

  const categories = await Category.find({});
  const tags = await Tag.find({});

  res.json({
    status: 'success',
    size: blogs.length,
    blogs,
    categories,
    tags
  });
});

exports.getBlogPhoto = catchAsync(async (req, res, next) => {
  const slug = req.params.slug.toLowerCase();
  const blog = await Blog.findOne({ slug });
  res.set('Content-Type', blog.photo.contentType);
  res.send(blog.photo.data);
});
