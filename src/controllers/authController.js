const User = require("../models/userModel");

const {
  uploadMultiFile,
  uploadSingleFile,
} = require("../services/fileService");
const authService = require("../services/authService");

const register = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    const result = await authService.registerService(
      name,
      email,
      password,
      phone,
      address,
    );
    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }
    res.status(201).json({
      message: "Đăng ký thành công",
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({ message: "Loi he thong" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui long nhap email va mat khau" });
    }
    const result = await authService.loginService(email, password);
    if (!result.success) {
      return res.status(result.status).json({ message: result.message });
    }
    res
      .status(200)
      .json({ message: "Đăng nhập thành công", data: result.data });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server" + error.message });
  }
};

module.exports = { register, login };
