const userModel = require('../models/userModel');

const getAllUsersService = async(queryString) =>{
    try{
        const page = parseInt(queryString.page) || 1;
        const limit = parseInt(queryString.limit) || 10;
        const skip = (page - 1) * limit;
        const result = await userModel.find().select('-password')
            .skip(skip)
            .limit(limit);
        const totalItems = await userModel.countDocuments();
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
module.exports = {getAllUsersService,getUserServiceById, putUserUpdateService,deleteUserService};