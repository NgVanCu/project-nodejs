const User = require('../models/userModel');

const createUserService = async (userData) => {
    try{
        const user = await User.create({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            phone: userData.phone,
            address: userData.address,
            image: userData.image, 
            role: 'user'
        });
        return user;
    }catch(error){
        throw error
    }
};

module.exports = { createUserService };