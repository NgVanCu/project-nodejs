const express = require('express');
const router = express.Router();
const { addToCartController, getMyCartController, removeCartItemController } = require('../controllers/cartController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, addToCartController);
router.get('/', verifyToken, getMyCartController);
router.delete('/', verifyToken, removeCartItemController);

module.exports = router;
