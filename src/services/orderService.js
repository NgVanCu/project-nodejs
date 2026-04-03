const cartModel = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const bookModel = require('../models/bookModel');

const createOrderService = async(userId, shippingAddress) =>{
    try{
        const cart = await cartModel.findOne({user:userId}).populate('cartItems.product');
        if(!cart || cart.cartItems.length === 0){
            throw new Error('Giỏ hàng trống!'); 
        }
        for(let item of cart.cartItems){
            if(item.qty > item.product.quantity){
                throw new Error(`Sách "${item.product.name}" trong kho chỉ còn ${item.product.quantity} cuốn. Không đủ hàng!`);
            }
        }
        const orderItems = cart.cartItems.map(
            (orderItem) => (
                {name: orderItem.product.name,
                 qty: orderItem.qty,
                 image: orderItem.product.thumbnail,
                 price: orderItem.product.price,
                 product:orderItem.product._id
                }
            )
        )
        let totalPrice = 0;
        for(let i = 0; i < orderItems.length; ++i){
            totalPrice += (orderItems[i].price * orderItems[i].qty);
        }
        const newOrder = await orderModel.create({
            user: userId,
            orderItems: orderItems,
            shippingAddress: shippingAddress,
            totalPrice: totalPrice
        });
        for(let orderItem of orderItems){
            await bookModel.findByIdAndUpdate(orderItem.product, {$inc:{quantity:-orderItem.qty,sold:orderItem.qty}});
        }
        await cartModel.findOneAndUpdate(
                {user:userId},
                { $set: { cartItems: [] } }
        );
        return newOrder;
    }catch(error){
        throw error;
    }
}
const getAllOrdersService = async () => {
    try {
        const orders = await orderModel.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        throw error;
    }
}
const getMyOrdersService = async (userId) => {
    try {
        const orders = await orderModel.find({user:userId})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return orders;
    } catch (error) {
        throw error;
    }
}
const updateOrderStatusService = async(orderId,status) =>{
    try{
        const result = await orderModel.findByIdAndUpdate(orderId,{status:status},{new:true});
        return result;
    }catch(error){
        throw error;
    }
}
module.exports = {createOrderService, getAllOrdersService, getMyOrdersService,updateOrderStatusService};