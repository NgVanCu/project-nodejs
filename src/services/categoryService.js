const categoryModel = require('../models/categoryModel')
const slugify = require('slugify');
const createCategoryService = async(data) =>{
    try{
        const categorySlug = data.slug || slugify(data.name, { lower: true, locale: 'vi' });
        const result = await categoryModel.create({
            name: data.name,
            slug: categorySlug
        });
        return result;
    }catch(error){
        throw error
    }
}
const getNameCategoryService = async (id) => {
    try {
        const name = await categoryModel.findById(id).select('name');
        return name;
    } catch (error) {
        throw error;
    }
};
const getAllCategoriesService = async () => {
    try {
        return await categoryModel.find({ isActive: true }).select('_id name slug');
    } catch (error) {
        throw error;
    }
};
module.exports = {createCategoryService, getNameCategoryService,getAllCategoriesService };