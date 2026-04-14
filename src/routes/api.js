const express = require("express");
const router = express.Router();

const authRoute = require("./authRoute");
const bookRoute = require("./bookRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");
const userRoute = require("./userRoute");
const categoryRoute = require("./categoryRoute");

router.use("/auth", authRoute);
router.use("/book", bookRoute);
router.use("/cart", cartRoute);
router.use("/order", orderRoute);
router.use("/user", userRoute);
router.use("/category", categoryRoute);

module.exports = router;
