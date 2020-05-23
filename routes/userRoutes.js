const express = require('express');
const router = express.Router();
const {
  checkToken,
  restrictedToUser,
  restrictedToAdmin
} = require('../controllers/authController');
const {
  getProfile,
  getPublicProfile,
  getProfilePhoto,
  updateProfile
} = require('../controllers/userController');

router
  .route('/profile')
  .get(checkToken, restrictedToUser, getProfile)
  .put(checkToken, restrictedToUser, updateProfile);
router.get('/users/:username/photo', getProfilePhoto);
router.get('/users/profile/:username', getPublicProfile);

module.exports = router;
