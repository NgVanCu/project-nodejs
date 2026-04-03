const isAdmin = (req,res,next) =>{
    if(req.user && req.user.role === 'admin'){
        next();
    }else{
        return res.status(403).json({message: 'Từ chối truy cập'});
    }
}
module.exports = isAdmin;