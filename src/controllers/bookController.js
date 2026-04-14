const Book = require("../models/bookModel");
const {
  uploadMultiFile,
  uploadSingleFile,
} = require("../services/fileService");
const bookService = require("../services/bookService");

const createBook = async (req, res, next) => {
  try {
    const {
      name,
      price,
      originalPrice,
      author,
      quantity,
      description,
      category,
    } = req.body;
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("Vui lòng upload ảnh của book.");
    }
    let resultSingImage = "";
    let resultMultiImage = [];
    if (req.files.thumbnail) {
      const tmp = Array.isArray(req.files.thumbnail)
        ? req.files.thumbnail[0]
        : req.files.thumbnail;
      const result = await uploadSingleFile(tmp, "book");
      if (result.status === "success") {
        resultSingImage = result.path;
      }
    }
    if (req.files.slider) {
      let slierFile = req.files.slider;
      if (!Array.isArray(slierFile)) {
        slierFile = [slierFile];
      }
      let result = await uploadMultiFile(slierFile, "book");
      if (result && result.detail) {
        let tmp = result.detail;
        for (let i = 0; i < tmp.length; ++i) {
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
      description,
    };
    const tmp = await bookService.createBookService(newBook);
    res.status(201).json({
      success: true,
      message: "Thêm Book thành công",
      data: tmp,
    });
  } catch (err) {
    next(err);
  }
};

const getAllBooks = async (req, res, next) => {
  try {
    const result = await bookService.getAllBooksService(req.query);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách sách thành công",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getBookById = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const book = await bookService.getBookByIdService(bookId);
    res
      .status(200)
      .json({ success: true, message: "Lấy sách thành công", data: book });
  } catch (err) {
    next(err);
  }
};
const updateBook = async (req, res, next) => {
  try {
    const id = req.params.id;

    const {
      name,
      price,
      originalPrice,
      author,
      quantity,
      description,
      category,
    } = req.body;

    const bookUpdate = { name, price, originalPrice, category, author, quantity, description };

    if (req.files && req.files.thumbnail) {
      const tmp = Array.isArray(req.files.thumbnail)
        ? req.files.thumbnail[0]
        : req.files.thumbnail;
      const singImage = await uploadSingleFile(tmp, "book");
      if (singImage.status === "success") {
        bookUpdate.thumbnail = singImage.path;
      }
    }

    if (req.files && req.files.slider) {
      let sliderFiles = req.files.slider;
      if (!Array.isArray(sliderFiles)) {
        sliderFiles = [sliderFiles];
      }
      const result = await uploadMultiFile(sliderFiles, "book");
      if (result && result.detail) {
        bookUpdate.slider = result.detail.map((f) => f.path);
      }
    }

    const tmp = await bookService.updateBookService(id, bookUpdate);
    return res.status(200).json({
      success: true,
      message: "Cập nhật sách thành công",
      data: tmp,
    });
  } catch (err) {
    next(err);
  }
};
const deleteBook = async (req, res, next) => {
  try {
    const id = req.params.id;
    const result = await bookService.deleteBookService(id);

    res.status(200).json({
      success: true,
      message: "Xóa Book thành công",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const restoreBook = async (req, res, next) => {
  try {
    const bookId = req.params.id;
    const result = await bookService.restoreBookService(bookId);
    res.status(200).json({
      success: true,
      message: "Restore Book thành công",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  createBook,
  getAllBooks,
  getBookById,
  updateBook,
  deleteBook,
  restoreBook,
};
