    const mongoose = require('mongoose');
    const mongoose_delete = require('mongoose-delete');
    const bookSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        }, // giá bán
        originalPrice: { type: Number, min: 0 }, // giá gốc
        thumbnail: { type: String, required: true }, // ảnh ở trang chủ
        slider: [{ type: String }], // ảnh nhỏ chi tiết sản phẩm
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
        author: { type: String, required: true },
        sold: { type: Number, default: 0 },
        rating: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
        quantity: { type: Number, required: true, default: 0 },
        description: { type: String },
    }, { 
        timestamps: true 
    });
    bookSchema.plugin(mongoose_delete,{
        deletedAt: true,
        overrideMethods: 'all'
    });
    module.exports = mongoose.model('Book', bookSchema);