const express = require('express');
const router = express.Router();
const { createCategoryController, getCategories } = require('../controllers/categoryController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/', getCategories);
router.post('/', verifyToken, verifyAdmin, createCategoryController);

module.exports = router;
