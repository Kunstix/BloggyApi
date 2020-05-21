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
  getRelatedBlogs
} = require('../controllers/blogController');
const {
  checkToken,
  restrictedToUser,
  restrictedToAdmin
} = require('../controllers/authController');

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
