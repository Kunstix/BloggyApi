const express = require('express');
const router = express.Router();
const {
  sendEmail,
  sendEmailToAuthor
} = require('../controllers/contactController');
const { contactFormValidator } = require('../validators/formValidator');
const { validate } = require('../validators');

router.route('/contact/form').post(contactFormValidator, validate, sendEmail);
router
  .route('/contact/author')
  .post(contactFormValidator, validate, sendEmailToAuthor);

module.exports = router;
