const fs = require('fs');
const formidable = require('formidable');
const slugify = require('slugify');
const _ = require('lodash');
const stripHtml = require('string-strip-html');
const Blog = require('../models/BlogModel');
const User = require('../models/UserModel');
const Category = require('../models/CategoryModel');
const Tag = require('../models/TagModel');
const AppErr = require('../utils/appError');
const Factory = require('./handlerFactory');
const APIFeatures = require('../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const { smartTrim } = require('../utils/blogUtil');

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

exports.getBlog = Factory.getOneBySlug(
  Blog,
  defaultPopOptions,
  '_id title body slug mtitle mdesc excerpt categories tags postedBy createdAt updatedAt'
);
exports.deleteBlog = Factory.deleteOneBySlug(Blog);
exports.getAllBlogs = Factory.getAll(Blog, defaultPopOptions);

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
  blog.excerpt = smartTrim(body, 420, ' ', ' ...');
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

exports.getAll = catchAsync(async (req, res, next) => {
  // QUERY FEATURES
  const features = new APIFeatures(Blog.find({}), req.query).paginate().sort();
  let query = features.query
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select(
      '_id title slug excerpt categories tags postedBy createdAt updatedAt'
    );

  const blogs = await query;
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
  if (!blog) {
    return next(new AppErr('No image found.', 400));
  }
  res.set('Content-Type', blog.photo.contentType);
  res.send(blog.photo.data);
});

exports.getRelatedBlogs = catchAsync(async (req, res, next) => {
  const { _id, categories } = req.body.blog;

  // QUERY FEATURES
  const features = new APIFeatures(
    Blog.find({
      _id: { $ne: _id },
      categories: { $in: categories }
    }),
    req.query
  )
    .paginate()
    .sort();

  const query = features.query
    .populate('postedBy', '_id name username profile')
    .select('title slug excerpt postedBy createdAt updatedAt');

  const blogs = await query;
  if (!blogs) {
    return next(new AppErr('Blogs not found'), 400);
  }

  res.json({
    status: 'success',
    size: blogs.length,
    data: blogs
  });
});

exports.getSearchedBlogs = catchAsync(async (req, res, next) => {
  const { search, limit = 5, skip = 0 } = req.query;
  if (search) {
    const blogs = await Blog.find({
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } }
      ]
    })
      .limit(limit * 1)
      .skip(skip * 1)
      .select('-photo -body');

    return res.json({
      status: 'success',
      size: blogs.length,
      blogs
    });
  }
  res.json({
    status: 'success',
    size: 0,
    blogs: []
  });
});

exports.getBlogsByUser = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ username: req.params.username });

  if (!user) {
    return next(new AppErr('No user found', 400));
  }

  const data = await Blog.find({ postedBy: user._id })
    .populate('categories', '_id name slug')
    .populate('tags', '_id name slug')
    .populate('postedBy', '_id name username')
    .select('_id title slug postedBy createdAt updatedAt');

  return res.json({
    status: 'success',
    size: data.length,
    data
  });
});
