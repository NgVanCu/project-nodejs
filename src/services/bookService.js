
const bookModel = require('../models/bookModel');


const createBookService = async(newBook) =>{
    try{
        const result = await bookModel.create(newBook)
        return result;
    }catch(error){
        throw error
    }
}
const putBookService = async(bookId,updateBook) => {
    try{
        const result = await bookModel.findByIdAndUpdate(bookId, updateBook, { new: true });
        return result;
    }catch(error){
        throw error
    }
}
const getAllBooksService = async(queryString) =>{
    try{
        let query = {}
        if(queryString.name){
            query.name = { $regex: queryString.name, $options: 'i' };
        }
        if(queryString.category){
            const categoryIds = queryString.category.split(',');
            query.category = {$in: categoryIds};
        }
        if (queryString.minPrice || queryString.maxPrice) {
            query.price = {};
            if (queryString.minPrice) query.price.$gte = Number(queryString.minPrice);
            if (queryString.maxPrice) query.price.$lte = Number(queryString.maxPrice);
        }
        const page = parseInt(queryString.page) || 1;
        const limit = parseInt(queryString.limit) || 10;
        const skip = (page - 1) * limit;
        const result = await bookModel.find(query)
            .populate('category', 'name slug')
            .skip(skip)
            .limit(limit)
            .sort(queryString.sort || '-createdAt');
        const totalItems = await bookModel.countDocuments(query);
        return {
            results: result,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
        };

    }catch(error){
        throw error;
    }
}
const deleteBookService = async(bookId) =>{
    try {
        const result = await bookModel.deleteById(bookId);
        return result;
    }catch(error){
        throw error;
    }
}
const restoreUserService = async(id) =>{
    try{
        const result = await bookModel.restore({ _id: id });
        return result;          
    }catch(error){
        throw error;
    }
}
module.exports = {createBookService, getAllBooksService,putBookService,deleteBookService}