const express = require('express');
const router = express.Router();
const { time } = require('../controllers/blogController');

router.get('/', time);

module.exports = router;
