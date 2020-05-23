const express = require('express');
const router = express.Router();
const {
  preSignup,
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');
const {
  userSignupValidator,
  userLoginValidator,
  emailValidator,
  passwordValidator
} = require('../validators/authValidator');
const { validate } = require('../validators');

router.post('/presignup', userSignupValidator, validate, preSignup);
router.post('/signup', signup);
router.post('/login', userLoginValidator, validate, login);
router.get('/logout', logout);
router.put('/password/forgot', emailValidator, validate, forgotPassword);
router.put('/password/reset', passwordValidator, validate, resetPassword);

module.exports = router;
