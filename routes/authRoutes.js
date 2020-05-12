const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  logout,
  isLoggedIn
} = require('../controllers/authController');
const {
  userSignupValidator,
  userLoginValidator
} = require('../validators/authValidator');
const { validate } = require('../validators');

router.post('/signup', userSignupValidator, validate, signup);
router.post('/login', userLoginValidator, validate, login);
router.get('/logout', logout);

module.exports = router;
