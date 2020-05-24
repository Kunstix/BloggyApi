const express = require('express');
const router = express.Router();
const {
  getTag,
  createTag,
  deleteTag,
  getAllTags
} = require('../controllers/tagController');
const { tagValidator } = require('../validators/tagValidator');
const { validate } = require('../validators');
const {
  checkToken,
  restrictedToAdmin
} = require('../controllers/authController');

router
  .route('/tags/:slug')
  .get(getTag)
  .delete(checkToken, restrictedToAdmin, deleteTag);

router
  .route('/tags')
  .post(tagValidator, validate, checkToken, restrictedToAdmin, createTag)
  .get(getAllTags);

module.exports = router;
