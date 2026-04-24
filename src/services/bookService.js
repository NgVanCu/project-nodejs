const Book = require("../models/bookModel");

const createBookService = async (data) => {
  const newBook = new Book(data);
  await newBook.save();
  return newBook;
};

const getAllBooksService = async (queryString) => {
  let query = {};
  if (queryString.name) {
    query.name = { $regex: queryString.name, $options: "i" };
  }
  if (queryString.category) {
    const categoryIds = queryString.category.split(",");
    query.category = { $in: categoryIds };
  }
  if (queryString.minPrice || queryString.maxPrice) {
    query.price = {};
    if (queryString.minPrice) query.price.$gte = Number(queryString.minPrice);
    if (queryString.maxPrice) query.price.$lte = Number(queryString.maxPrice);
  }
  const page = parseInt(queryString.page) || 1;
  const limit = parseInt(queryString.limit) || 10;
  const skip = (page - 1) * limit;
  const result = await Book.find(query)
    .populate("category", "name slug")
    .skip(skip)
    .limit(limit)
    .sort(queryString.sort || "-createdAt");
  const totalItems = await Book.countDocuments(query);
  return {
    results: result,
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  };
};

const getBookByIdService = async (bookId) => {
  const book = await Book.findById(bookId).populate("category", "name slug");
  if (!book) {
    throw new Error("Book không tồn tại");
  }
  return book;
};

const updateBookService = async (bookId, data) => {
  const updatedBook = await Book.findByIdAndUpdate(bookId, data, {
    new: true,
  });
  if (!updatedBook) {
    throw new Error("Book không tồn tại");
  }
  return updatedBook;
};

const deleteBookService = async (bookId) => {
  const deletedBook = await Book.findByIdAndUpdate(bookId, { deleted: true });
  if (!deletedBook) {
    throw new Error("Book không tồn tại");
  }
  return deletedBook;
};

const restoreBookService = async (id) => {
  const result = await Book.restore({ _id: id });

  if (!result) {
    throw new Error("Book không tồn tại");
  }

  return result;
};

module.exports = {
  createBookService,
  getAllBooksService,
  getBookByIdService,
  updateBookService,
  deleteBookService,
  restoreBookService,
};
