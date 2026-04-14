const express = require('express');
const router = express.Router();
const {
  createOrderController,
  getAllOrdersController,
  getMyOrdersController,
  updateOrderStatusController,
} = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.post('/', verifyToken, createOrderController);
router.get('/my', verifyToken, getMyOrdersController);
router.get('/', verifyToken, verifyAdmin, getAllOrdersController);
router.put('/:id/status', verifyToken, verifyAdmin, updateOrderStatusController);

module.exports = router;
