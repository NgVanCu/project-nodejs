const userModel = require('../models/userModel');

const getAllUsersService = async(queryString) =>{
    try{
        const page = parseInt(queryString.page) || 1;
        const limit = parseInt(queryString.limit) || 10;
        const skip = (page - 1) * limit;
        // findWithDeleted để admin thấy cả tài khoản bị khóa
        const result = await userModel.findWithDeleted().select('-password')
            .skip(skip)
            .limit(limit);
        const totalItems = await userModel.countDocumentsWithDeleted();
        return {
            results: result,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
        };
    }catch(error){
        throw error;
    }
}

const getUserServiceById = async(userId) =>{
    try{
        const user = await userModel.findById(userId).select('-password');
        return user;
    }catch(error){
        throw error;
    }
}
const putUserUpdateService = async(userId, dataUpdate) => {
    try{
        if (dataUpdate.phone) {
            const existing = await userModel.findOne({ phone: dataUpdate.phone, _id: { $ne: userId } });
            if (existing) {
                const err = new Error('Số điện thoại đã được sử dụng');
                err.status = 400;
                throw err;
            }
        }
        const user = await userModel.findByIdAndUpdate(userId, dataUpdate, { new: true });
        return user;
    }catch(error){
        throw error;
    }
}
const deleteUserService = async (id) => {
    try {
        const deletedUser = await userModel.deleteById(id);      
        return deletedUser;
    } catch (error) {
        throw error;
    }
}
const restoreUserService = async(id) =>{
    try{
        const result = await userModel.restore({ _id: id });
        return result;          
    }catch(error){
        throw error;
    }
}
module.exports = {getAllUsersService, getUserServiceById, putUserUpdateService, deleteUserService, restoreUserService};