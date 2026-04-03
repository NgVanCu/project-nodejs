const {addToCartService,getMyCartService,removeCartItemService} = require('../services/cartService')

const addToCartController = async(req, res) =>{
    try{
        const {bookId, quantity} = req.body;
        const userId = req.user._id;
        const result = await addToCartService(userId, bookId, quantity);
        return res.status(201).json({
            message: 'Thêm giỏ hàng thành công',
            data: result
        })
    }catch(error){
        return res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const getMyCartController = async(req, res) =>{
    try{
        const userId = req.user._id;
        const result = await getMyCartService(userId);
        if (!result) {
            return res.status(200).json({
                message: 'Giỏ hàng đang trống',
                data: { cartItems: [] }
            });
        }
        return res.status(200).json({
            message: 'Danh sách giỏ hàng',
            data: result
        })
    }catch(error){
        return res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const removeCartItemController = async(req, res) =>{
    try{
        const userId = req.user._id;
        const {bookId} = req.query;
        const result = await removeCartItemService(userId, bookId);
        return res.status(200).json({
            message: 'Xóa giỏ hàng thành công',
            data: result
        })
    }catch(error){
        return res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
module.exports = {addToCartController,getMyCartController,removeCartItemController };