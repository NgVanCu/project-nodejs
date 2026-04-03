const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true }, 
            product: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Book'
            }
        }
    ],
    shippingAddress: {
        fullName: { type: String, required: true }, 
        address: { type: String, required: true },  
        city: { type: String, required: true },
        phone: { type: String, required: true }, 
    },
    totalPrice: { 
        type: Number, 
        required: true, 
        default: 0 
    },
    status: {
        type: String,
        default: 'Chưa thanh toán',
        enum: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hủy'] 
    }  
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Order', orderSchema);