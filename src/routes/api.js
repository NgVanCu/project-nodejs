const express = require('express');
const routerAPI = express.Router();

const getHomePage = require('../controllers/homeController')
const {createCategoryController} = require('../controllers/categoryController');
const {registerUser,loginUser} = require('../controllers/authController');
const {getAllUserController,getUserById,PutUpdateUser,deleteUser} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware')
const isAdmin = require('../middlewares/adminMiddleware');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');
const {createBookController,putUpdateBookController,deleteBookController} = require('../controllers/bookController');
routerAPI.post('/register',validateRegister,registerUser);
routerAPI.post('/login', validateLogin ,loginUser);
routerAPI.post('/categories', createCategoryController)
// routerAPI.post('/file', uploadFile);
routerAPI.post('/create-book', createBookController);
routerAPI.get('/view-users', authMiddleware,isAdmin,getAllUserController);
// routerAPI.get('/view-user', authMiddleware,isAdmin,getUserById);
// routerAPI.put('/update-user', authMiddleware,isAdmin,PutUpdateUser);
// routerAPI.delete('/delete-user', authMiddleware,isAdmin,deleteUser);
module.exports = routerAPI;