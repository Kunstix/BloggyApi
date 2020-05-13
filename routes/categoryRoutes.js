const express = require('express');
const router = express.Router();
const {
  getCategory,
  createCategory,
  deleteCategory,
  getAllCategories
} = require('../controllers/categoryController');
const { categoryValidator } = require('../validators/categoryValidator');
const { validate } = require('../validators');
const {
  checkToken,
  restrictedToAdmin
} = require('../controllers/authController');

router
  .route('/categories')
  .post(
    categoryValidator,
    validate,
    checkToken,
    restrictedToAdmin,
    createCategory
  )
  .get(getAllCategories);

router
  .route('/categories/:slug')
  .get(getCategory)
  .delete(checkToken, restrictedToAdmin, deleteCategory);

module.exports = router;
