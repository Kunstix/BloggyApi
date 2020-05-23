const { check } = require('express-validator');

exports.userSignupValidator = [
  check('name').not().isEmpty().withMessage('Name is required.'),
  check('email').isEmail().withMessage('Invalid Email.'),
  check('password')
    .isLength({ min: 10 })
    .withMessage('Password must consist of at least 10 characters')
];

exports.userLoginValidator = [
  check('email').isEmail().withMessage('Invalid Email.'),
  check('password')
    .isLength({ min: 10 })
    .withMessage('Password must consist of at least 10 characters')
];

exports.emailValidator = [
  check('email').isEmail().withMessage('Invalid Email.')
];

exports.passwordValidator = [
  check('password')
    .isLength({ min: 10 })
    .withMessage('Password must consist of at least 10 characters')
];
