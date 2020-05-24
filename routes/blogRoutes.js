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

// Special
router.get('/blogs/search', getSearchedBlogs);
router.get('/blogs-categories-tags', getAll);
router.post('/blogs/related', getRelatedBlogs);
router.route('/blogs/:slug/photo').get(getBlogPhoto);

// REST
router
  .route('/blogs/:slug')
  .get(getBlog)
  .put(checkToken, restrictedToAdmin, updateBlog)
  .delete(checkToken, restrictedToAdmin, deleteBlog);
router
  .route('/blogs')
  .get(getAllBlogs)
  .post(checkToken, restrictedToAdmin, createBlog);

module.exports = router;
