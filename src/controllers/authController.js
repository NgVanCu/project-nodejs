const User = require('../models/userModel')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {uploadMultiFile, uploadSingleFile} = require('../services/fileService');
const {createUserService} = require('../services/authService')

const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone, address } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email này đã tồn tại' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        let imageUrl = "";
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('Vui lòng upload ảnh đại diện.');
        }

        let fileImage = req.files.image;
        if (Array.isArray(fileImage)) {
            fileImage = fileImage[0];
        }

        let result = await uploadSingleFile(fileImage, 'user');

        if (result.status === 'success') {
            imageUrl = result.path;
        } else {
            return res.status(500).json({ 
                message: 'Upload ảnh thất bại: ' + result.error 
            });
        }
        const userData = {
            name,
            email,
            password: hashPassword, 
            phone,
            address,
            image: imageUrl 
        };

        const newUser = await createUserService(userData);
        return res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                image: newUser.image,
                address: newUser.address
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
}
const loginUser = async(req,res) =>{
    try{
        const {email,password} = req.body;

        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message : 'Email chưa đăng ký!'});
        }

        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message: 'Password không đúng'});
        }
        if (!process.env.JWT_SECRET) {
            throw new Error("Không cấu hình JWT_SECRET trong file .env!");
        }      
        const token = jwt.sign(
            {id: user._id, role: user.role},
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.status(200).json({
            message: 'Đăng nhập thành công',
            token: token,
            user: {
                name: user.name,
                email: user.email,
                role: user.role
            }            
        })
    }catch(error){
        res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
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
module.exports = {registerUser,loginUser};

