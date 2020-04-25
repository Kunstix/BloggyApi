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

// test
router.get('/secret', isLoggedIn, (req, res) => {
  res.json({
    message: 'SECRET'
  });
});

module.exports = router;
