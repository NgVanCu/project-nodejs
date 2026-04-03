const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Tên danh mục là bắt buộc'],
        trim: true,
        unique: true 
    },
    slug: { 
        type: String, 
        lowercase: true, 
        unique: true,
        index: true 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);