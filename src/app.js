require("dotenv").config();
const path = require("path");
const fileUpload = require("express-fileupload");
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8080;

const apiRouter = require("./routes/api");
const connectDB = require("./configs/db");

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());

// Serve static files (book/user images)
app.use("/images", express.static(path.join(__dirname, "public/images")));

connectDB();

app.use("/api", apiRouter);

// JSON error handler — must be after all routes
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Lỗi server';
  res.status(status).json({ success: false, message });
});

app.listen(port, () => {
  console.log(`Server đang chạy tại port ${port}`);
});
