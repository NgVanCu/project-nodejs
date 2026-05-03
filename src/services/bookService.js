const Book  = require("../models/bookModel");
const Order = require("../models/orderModel");
const User  = require("../models/userModel");
const { filterBadWords } = require("../utils/badWordsFilter");

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

const addReviewService = async (bookId, userId, userName, rating, comment) => {
  const book = await Book.findById(bookId);
  if (!book) throw new Error('Sách không tồn tại');

  // Nếu userName không có trong token, query DB
  if (!userName) {
    const user = await User.findById(userId).select('name');
    if (!user) throw new Error('Người dùng không tồn tại');
    userName = user.name;
  }

  // Chỉ cho review khi có đơn hàng Hoàn thành chứa sách này
  const completedOrder = await Order.findOne({
    user: userId,
    status: 'Hoàn thành',
    'orderItems.product': bookId,
  });
  if (!completedOrder) throw new Error('Bạn chỉ có thể đánh giá sách đã mua và đơn hàng đã hoàn thành');

  // Mỗi user chỉ review 1 lần
  const alreadyReviewed = book.reviews.find(r => r.user.toString() === userId.toString());
  if (alreadyReviewed) throw new Error('Bạn đã đánh giá sách này rồi');

  const { filtered: filteredComment } = filterBadWords(comment || '');
  book.reviews.push({ user: userId, name: userName, rating: Number(rating), comment: filteredComment });
  book.numReviews = book.reviews.length;
  book.rating = book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length;
  await book.save();
  return book;
};

const deleteReviewService = async (bookId, reviewId) => {
  const book = await Book.findById(bookId);
  if (!book) throw new Error('Sách không tồn tại');

  const idx = book.reviews.findIndex(r => r._id.toString() === reviewId);
  if (idx === -1) throw new Error('Đánh giá không tồn tại');

  book.reviews.splice(idx, 1);
  book.numReviews = book.reviews.length;
  book.rating = book.reviews.length > 0
    ? book.reviews.reduce((sum, r) => sum + r.rating, 0) / book.reviews.length
    : 0;
  await book.save();
  return book;
};

module.exports = {
  createBookService,
  getAllBooksService,
  getBookByIdService,
  updateBookService,
  deleteBookService,
  restoreBookService,
  addReviewService,
  deleteReviewService,
};
