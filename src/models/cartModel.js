const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cartItems:[{
        product:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Book',
            required: true
        },
        qty:{
            type: Number,
            default: 1,
            min: 1
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);