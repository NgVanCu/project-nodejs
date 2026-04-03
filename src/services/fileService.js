
const path = require('path');

const uploadSingleFile = async(fileObject, folderName) =>{
    const uploadPath = path.resolve (__dirname ,'../public/images', folderName);

    const extName = path.extname(fileObject.name); // lấy đuôi của tên file

    const baseName = path.basename(fileObject.name, extName); // lấy tên file

    const finalName = `${baseName}-${Date.now()}${extName}`;
    const finalPath = `${uploadPath}/${finalName}`;
    try{
        await fileObject.mv(finalPath);
        return {
            status: 'success',
            path: finalName,
            error: null
        };
    }catch(error){
        console.error("Lỗi khi lưu file:", error);
        return {
            status: 'failed',
            path: null,
            error: JSON.stringify(error)
        };       
    }
}   

const uploadMultiFile = async(fileArr,folderName)=>{
   const uploadPath = path.resolve (__dirname ,'../public/images',folderName);
   const resultArr = []
   for(let i = 0; i < fileArr.length; ++i){
        const extName = path.extname(fileArr[i].name); // lấy đuôi của tên file

        const baseName = path.basename(fileArr[i].name, extName); // lấy tên file

        const finalName = `${baseName}-${Date.now()}-${i}${extName}`;
        const finalPath = `${uploadPath}/${finalName}`;
        try{
            await fileArr[i].mv(finalPath);
            resultArr.push({
                status: 'success',
                path: finalName,
                fileName: fileArr[i].name,
                error: null
            })
        }catch(error){
            console.error("Lỗi khi lưu file:", error);
            resultArr.push( {
                status: 'failed',
                path: null,
                fileName: fileArr[i].name,
                error: JSON.stringify(error)
            });       
        }    
   }
   return {
        detail: resultArr,
   }; 
}
module.exports = {uploadSingleFile,uploadMultiFile};