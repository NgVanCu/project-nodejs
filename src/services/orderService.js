const cartModel  = require('../models/cartModel');
const orderModel = require('../models/orderModel');
const bookModel  = require('../models/bookModel');

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
const updateOrderStatusService = async (orderId, status) => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order) throw new Error('Đơn hàng không tồn tại');

        // Khi hủy/hoàn hàng: cộng lại tồn kho và trừ số đã bán
        // Chỉ hoàn kho nếu đơn chưa ở trạng thái Đã hủy trước đó
        if (status === 'Đã hủy' && order.status !== 'Đã hủy') {
            for (const item of order.orderItems) {
                await bookModel.findByIdAndUpdate(
                    item.product,
                    { $inc: { quantity: item.qty, sold: -item.qty } }
                );
            }
        }

        order.status = status;
        await order.save();
        return order;
    } catch (error) {
        throw error;
    }
}
const cancelOrderByUserService = async (orderId, userId) => {
    try {
        const order = await orderModel.findById(orderId);
        if (!order) throw new Error('Đơn hàng không tồn tại');
        if (order.user.toString() !== userId.toString()) throw new Error('Bạn không có quyền hủy đơn hàng này');

        const cancellableStatuses = ['Chờ xác nhận', 'Đang đóng gói'];
        if (!cancellableStatuses.includes(order.status)) {
            throw new Error('Không thể hủy đơn hàng đang ở trạng thái "' + order.status + '"');
        }

        // Hoàn lại tồn kho
        for (const item of order.orderItems) {
            await bookModel.findByIdAndUpdate(
                item.product,
                { $inc: { quantity: item.qty, sold: -item.qty } }
            );
        }

        order.status = 'Đã hủy';
        await order.save();
        return order;
    } catch (error) {
        throw error;
    }
}

module.exports = {createOrderService, getAllOrdersService, getMyOrdersService, updateOrderStatusService, cancelOrderByUserService};