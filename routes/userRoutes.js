const express = require('express');
const router = express.Router();
const {
  checkToken,
  isAuthenticated,
  isAdminRestricted
} = require('../controllers/authController');
const { getProfile } = require('../controllers/userController');

router.get('/profile', checkToken, isAuthenticated, getProfile);
router.get('/admin', checkToken, isAdminRestricted, getProfile);

module.exports = router;
