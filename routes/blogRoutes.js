const express = require('express');
const router = express.Router();
const { createBlog } = require('../controllers/blogController');
const {
  checkToken,
  restrictedToUser,
  restrictedToAdmin
} = require('../controllers/authController');

router.post('/blogs', checkToken, restrictedToAdmin, createBlog);

module.exports = router;
