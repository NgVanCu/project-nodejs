const jwt = require('jsonwebtoken');

const authMiddleware = (req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer ')){
            return res.status(401).json({message: 'Bạn chưa đăng nhập'});
        }
        const token = authHeader.split(' ')[1];
        if (!process.env.JWT_SECRET) {
            throw new Error("Không cấu hình JWT_SECRET trong file .env!");
        }      
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
    }
}
module.exports = authMiddleware;