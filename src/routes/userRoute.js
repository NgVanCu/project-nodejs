const express = require('express');
const router = express.Router();
const {
  getAllUserController,
  getUserById,
  PutUpdateUser,
  deleteUser,
} = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, verifyAdmin, getAllUserController);
router.get('/:id', verifyToken, getUserById);
router.put('/:id', verifyToken, PutUpdateUser);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

module.exports = router;
