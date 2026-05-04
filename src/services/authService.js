const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerService = async (name, email, password, phone, address) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return { success: false, status: 400, message: "Email này đã tồn tại" };
  }
  const existingPhone = await User.findOne({ phone });
  if (existingPhone) {
    return { success: false, status: 400, message: "Số điện thoại đã được sử dụng" };
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    phone,
    address,
  });
  await newUser.save();
  return {
    success: true,
    data: {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

const loginService = async (email, password) => {
  const user = await User.findOneWithDeleted({ email });
  if (!user) {
    return {
      success: false,
      status: 400,
      message: "Email hoặc mật khẩu không đúng",
    };
  }
  if (user.deleted) {
    return {
      success: false,
      status: 403,
      message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
    };
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return {
      success: false,
      status: 404,
      message: "Email hoặc mật khẩu không đúng",
    };
  }
  const token = jwt.sign(
    { id: user._id, name: user.name, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
  return {
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    },
  };
};

module.exports = { registerService, loginService };
