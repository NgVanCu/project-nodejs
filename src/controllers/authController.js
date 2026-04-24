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

    // let imageUrl = "";
    // if (!req.files || Object.keys(req.files).length === 0) {
    //   return res.status(400).send("Vui lòng upload ảnh đại diện.");
    // }

    // let fileImage = req.files.image;
    // if (Array.isArray(fileImage)) {
    //   fileImage = fileImage[0];
    // }

    // let result = await uploadSingleFile(fileImage, "user");

    // if (result.status === "success") {
    //   imageUrl = result.path;
    // } else {
    //   return res.status(500).json({
    //     message: "Upload ảnh thất bại: " + result.error,
    //   });
    // }
    // const userData = {
    //   name,
    //   email,
    //   password: hashPassword,
    //   phone,
    //   address,
    //   image: imageUrl,
    // };

    // const newUser = await createUserService(userData);
    // return res.status(201).json({
    //   message: "Đăng ký thành công",
    //   user: {
    //     _id: newUser._id,
    //     name: newUser.name,
    //     email: newUser.email,
    //     image: newUser.image,
    //     address: newUser.address,
    //   },
    // });
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
// const uploadFile = async(req,res) =>{
//     if (!req.files || Object.keys(req.files).length === 0) {
//         return res.status(400).send('No files were uploaded.');
//     }
//     try{
//         let result;
//         if(Array.isArray(req.files.image)){
//             result = await uploadMultiFile(req.files.image);
//         }else{
//             result = await uploadSingleFile(req.files.image);
//         }
//         return res.status(200).json({
//             message: "Upload successful!",
//             data: result
//         });
//     }catch(error){
//         console.error("DEBUG LỖI TẠI ĐÂY:", error);
//         res.status(500).json({message: 'Lỗi Server!'});
//     }
// }
module.exports = { register, login };
