const express = require('express');
const router = express.Router();
const {
  getBlog,
  getBlogPhoto,
  createBlog,
  deleteBlog,
  updateBlog,
  getAllBlogs,
  getAll,
  getRelatedBlogs,
  getSearchedBlogs,
  getBlogsByUser
} = require('../controllers/blogController');
const {
  checkToken,
  restrictedToUser,
  restrictedToAdmin,
  restrictedToMe
} = require('../controllers/authController');

// Users
router.get('/users/blogs/:username', getBlogsByUser);
router
  .route('/users/blogs/:slug')
  .put(checkToken, restrictedToUser, restrictedToMe, updateBlog)
  .delete(checkToken, restrictedToUser, restrictedToMe, deleteBlog);
router.post('/users/blogs', checkToken, restrictedToUser, createBlog);

// Admin
router.get('/blogs/search', getSearchedBlogs);
router.route('/blogs/:slug/photo').get(getBlogPhoto);
router
  .route('/blogs/:slug')
  .get(getBlog)
  .put(checkToken, restrictedToAdmin, updateBlog)
  .delete(checkToken, restrictedToAdmin, deleteBlog);
router
  .route('/blogs')
  .get(getAllBlogs)
  .post(checkToken, restrictedToAdmin, createBlog);
router.post('/blogs-categories-tags', getAll);
router.post('/blogs/related', getRelatedBlogs);

module.exports = router;
