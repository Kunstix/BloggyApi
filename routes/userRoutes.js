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
  updateProfile,
  getUsers,
  activateUser,
  deactivateUser,
  promoteUser,
  demoteUser
} = require('../controllers/userController');

router
  .route('/profile')
  .get(checkToken, restrictedToUser, getProfile)
  .put(checkToken, restrictedToUser, updateProfile);
router.get('/users/:username/photo', getProfilePhoto);
router.get('/users/profile/:username', getPublicProfile);
router.post('/users/activate', checkToken, restrictedToAdmin, activateUser);
router.post('/users/deactivate', checkToken, restrictedToAdmin, deactivateUser);
router.post('/users/promote', checkToken, restrictedToAdmin, promoteUser);
router.post('/users/demote', checkToken, restrictedToAdmin, demoteUser);
router.get('/users', checkToken, restrictedToAdmin, getUsers);

module.exports = router;
