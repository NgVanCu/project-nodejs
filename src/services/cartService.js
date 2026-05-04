
const cartModel = require('../models/cartModel');

const addToCartService = async(userId, bookId, quantity) =>{
    try{
        let cart = await cartModel.findOne({user:userId});
        if(!cart){
            const newCart = await cartModel.create({
                user: userId,
                cartItems: [{
                    product: bookId,
                    qty: quantity
                }]
            });
            return newCart;
        }
        const itemIndex = cart.cartItems.findIndex(
            (cartItem) => cartItem.product.toString() === bookId.toString()
        );
        if(itemIndex > -1){
            cart.cartItems[itemIndex].qty += quantity;
        }else{
            cart.cartItems.push({ product: bookId, qty: quantity });
        }
        await cart.save();
        return cart;
    }catch(error){
        throw error
    }
}
const getMyCartService = async(userId) =>{
    try{
        const result = await cartModel.findOne({user:userId})
            .populate('cartItems.product', 'name price thumbnail');
        return result;
    }catch(error){
        throw error
    }
}
const removeCartItemService= async(userId, bookId) =>{
    try{
        if(bookId){
            return await cartModel.findOneAndUpdate(
                {user:userId},
                {$pull:{cartItems:{product:bookId}}},
                { new: true }
            ).populate('cartItems.product', 'name price thumbnail');
        }else{
            return await cartModel.findOneAndUpdate(
                {user:userId},
                { $set: { cartItems: [] } },
                { new: true }
            );
        }
    }catch(error){
        throw error
    }
}
module.exports = {addToCartService,getMyCartService,removeCartItemService};