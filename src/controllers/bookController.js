const Book = require('../models/bookModel')
const {uploadMultiFile,uploadSingleFile} = require('../services/fileService');
const {createBookService,getAllBooksService,putBookService,deleteBookService} = require('../services/bookService')
const createBookController = async(req,res) =>{
    try{
        const {name,price,originalPrice,author,quantity,description,category} = req.body;
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('Vui lòng upload ảnh của book.');
        }
        let resultSingImage = '';
        let resultMultiImage = [];
        if(req.files.thumbnail){
            const tmp = Array.isArray(req.files.thumbnail) ? req.files.thumbnail[0] : req.files.thumbnail;
            const result = await uploadSingleFile(tmp, 'book');
            if(result.status === 'success'){
                resultSingImage = result.path;
            }
        }
        if(req.files.slider){
            let slierFile = req.files.slider;
            if(!Array.isArray(slierFile)){
                slierFile = [slierFile];
            }
            let result = await uploadMultiFile(slierFile, 'book');
            if(result&&result.detail){
                let tmp = result.detail;
                for(let i = 0; i < tmp.length; ++i){
                    resultMultiImage.push(tmp[i].path);
                }
            }
        }
        const newBook = {
            name,
            price, 
            originalPrice,
            category,
            thumbnail: resultSingImage,
            slider: resultMultiImage,
            author,
            quantity, 
            description
        }
        const tmp = await createBookService(newBook);
        return res.status(201).json({
            message: 'Thêm Book thành công',
            data: tmp
        })
    }catch(error){
        console.error(error);
        res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const getAllBooksController = async(req, res) =>{
    try{
        const result = await getAllBooksService(req.query);
        return res.status(200).json({
            message: 'Lấy danh sách sách thành công',
            data: result
        });
    }catch(error){
        res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const putUpdateBookController = async(req, res)=>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({ message: 'Thiếu Book ID' });
        }
        const {name,price,originalPrice,author,quantity,description,category} = req.body;
        let resultSingImage = '';
        let resultMultiImage = [];
        if(req.files.thumbnail){
            const tmp = Array.isArray(req.files.thumbnail) ? req.files.thumbnail[0] : req.files.thumbnail;
            const singImage = await uploadSingleFile(tmp, 'book');
            if(result.status === 'success'){
                resultSingImage = singImage.path;
            } 
        }
        if(req.files.slider){
            let resFile = req.files.slider;
            if(!Array.isArray(slierFile)){
                slierFile = [slierFile];
            }
            let result = await uploadMultiFile(slierFile, 'book');
            if(result&&result.detail){
                let tmp = result.detail;
                for(let i = 0; i < tmp.length; ++i){
                    resultMultiImage.push(tmp[i].path);
                }
            }
        }
        const bookUpdate = {
            name,
            price, 
            originalPrice,
            category,
            thumbnail: resultSingImage,
            slider: resultMultiImage,
            author,
            quantity, 
            description
        }
        const tmp = await putBookService(id, bookUpdate);
        return res.status(200).json({
            message: 'update thành công',
            data: tmp
        })
    }catch(error){
        res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
const deleteBookController = async(req,res) =>{
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({message: 'Hãy truyền ID'})
        }
        const result = await deleteBookService(id);
        if(result.deleteCount === 0 && result.modifiedCount === 0){
            return res.status(404).json({ message: 'Book dùng không tồn tại hoặc đã bị xóa trước đó' })
        }
        return res.status(200).json({
            message: 'Xóa Book thành công',
            data: result
        })
    }catch(error){
        res.status(500).json({message: 'Lỗi Server' + error.message})
    }
}
module.exports = {createBookController,getAllBooksController ,putUpdateBookController,deleteBookController};