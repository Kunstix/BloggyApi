const express = require('express');
const router = express.Router();
const {
  checkToken,
  restrictedToUser,
  restrictedToAdmin
} = require('../controllers/authController');
const { getProfile } = require('../controllers/userController');

router.get('/profile', checkToken, restrictedToUser, getProfile);
router.get('/admin', checkToken, restrictedToAdmin, getProfile);

module.exports = router;
