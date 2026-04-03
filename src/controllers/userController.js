const {getAllUsersService, getUserServiceById,putUserUpdateService,deleteUserService} = require('../services/userService')
const {uploadSingleFile} = require('../services/fileService')
const getAllUserController = async(req,res)=>{
    try{
        const Users = await getAllUsersService(req.query);
        if(!Users.results || Users.results.length === 0){
            return res.status(200).json({
                message: 'Hiện tại không có user nào',
                data: []
            });
        }
        return res.status(200).json({
            message: 'Danh sách Users',
            data: Users
        });
    }catch(error){
        return res.status(500).json({
            message: 'Lỗi Server' + error.message
        });
    }
}
const getUserById = async(req,res)=>{
    try{
        const userId = req.params.id;
        if(!userId){
            return res.status(200).json({
                status: 'ERR', 
                message: 'Vui lòng truyền UserId'                
            });
        }
        const user = await getUserServiceById(userId);
        if(!user){
            return res.status(404).json({
                message: 'Không có UserId này'
            });
        }
        return res.status(200).json({
            message: 'User có ID:' + userId,
            data: user
        })

    }catch(error){
        return res.status(500).json({
            message: 'Lỗi Server' + error.message
        });       
    }
}
const PutUpdateUser = async(req, res) =>{
    try {
        const id = req.params.id;
        const {name, phone, address, role} = req.body;
        if (!id) {
                return res.status(400).json({ message: 'Thiếu User ID' });
            }
        let userUpdate = {
                name: name,
                phone: phone,
                address:address,
                role: role
        }; 
        if (req.files && req.files.image) {
                const fileImage = Array.isArray(req.files.image) ? req.files.image[0] : req.files.image;
                let result = await uploadSingleFile(fileImage, 'user');
                if(result.status === 'success'){
                    userUpdate.image = result.path;
                }else{
                    return res.status(500).json({ 
                        message: 'Upload ảnh thất bại: ' + result.error 
                    });        
                }
        }
        const updatedUser = await putUserUpdateService(id, dataUpdate);

        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        return res.status(200).json({
            message: 'Cập nhật thành công',
            data: updatedUser 
        }); 
    }catch(error){
        return res.status(500).json({
            message: 'Lỗi Server' + error.message
        });
    }
}
const deleteUser = async(req,res) =>{
    try{
        const userId = req.params.id;
        if(!userId){
            return res.status(400).json({message: 'Hãy truyền Id'})
        }
        const result = await deleteUserService(userId);
        if(result.deletedCount === 0 && result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Người dùng không tồn tại hoặc đã bị xóa trước đó' })
        }
        return res.status(200).json({
            message: 'Xóa người dùng thành công',
            data: result
        })
    }catch(error){
        return res.status(500).json({
            message: 'Lỗi Server' + error.message
        });
    }
}
module.exports = {getAllUserController, getUserById,PutUpdateUser,deleteUser};