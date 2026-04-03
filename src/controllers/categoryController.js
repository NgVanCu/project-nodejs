const {createCategoryService,getNameCategoryService,getAllCategoriesService} = require('../services/categoryService');

const createCategoryController = async(req, res) =>{
    try{
        const {name, slug} = req.body;
        const tmp = {
            name: name,
            slug: slug
        }
        const result = await createCategoryService(tmp);
        return res.status(201).json({
            message: 'Tạo danh mục thành công',
            data: result
        })
    }catch(error){
        return res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const getCategories = async (req, res) => {
    try {
        const categories = await getAllCategoriesService();
        res.status(200).json({
            message: 'danh mục sản phẩm',
            data: categories
        });
    } catch (error) {
        return res.status(500).json({message: 'Lỗi Server' + error.message})
    }
};
module.exports = {createCategoryController,getCategories}