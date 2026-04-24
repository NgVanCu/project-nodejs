const express = require("express");
const router = express.Router();

const bookController = require("../controllers/bookController");
const { verifyToken, verifyAdmin } = require("../middlewares/authMiddleware");

router.post("/", verifyToken, verifyAdmin, bookController.createBook);
router.get("/", bookController.getAllBooks);

router.get("/:id", bookController.getBookById);
router.put("/:id", verifyToken, verifyAdmin, bookController.updateBook);
router.delete("/:id", verifyToken, verifyAdmin, bookController.deleteBook);
router.patch("/:id/restore", verifyToken, verifyAdmin, bookController.restoreBook);

module.exports = router;
