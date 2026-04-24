const { createOrderService, getAllOrdersService, getMyOrdersService, updateOrderStatusService } = require('../services/orderService');

const createOrderController = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const { shippingAddress } = req.body;
        const result = await createOrderService(userId, shippingAddress);
        return res.status(200).json({
            message: 'Tạo đơn hàng thành công!',
            data: result
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi tạo đơn: ' + error.message });
    }
}
const getAllOrdersController = async (req, res) => {
    try {
        const orders = await getAllOrdersService();
        return res.status(200).json({
            message: 'Lấy danh sách đơn hàng thành công',
            data: orders
        });
    } catch (error) {
        return res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
}
const getMyOrdersController = async(req, res) =>{
    try{
        const orders = await getMyOrdersService(req.user.id || req.user._id);
        return res.status(200).json({
            message: 'Lấy lịch sử đơn hàng thành công',
            data: orders
        });
    }catch(error){
        return res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
}
const updateOrderStatusController = async(req, res) =>{
    try{
        const orderId = req.params.id;
        const { status } = req.body;
        const result = await updateOrderStatusService(orderId,status);
        return res.status(200).json({
            message: 'Cập nhật status',
            data: result
        })
    }catch(error){
        return res.status(500).json({ message: 'Lỗi Server: ' + error.message });
    }
}
module.exports = { createOrderController, getAllOrdersController,getMyOrdersController,updateOrderStatusController};