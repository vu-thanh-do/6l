const Review = require("../models/review");
const Product = require("../models/product");

const reviewController = {
  // Thêm đánh giá mới
  addReview: async (req, res) => {
    try {
      const { userId, bookId, rating, comment } = req.body;

      // Kiểm tra xem người dùng đã đánh giá sách này chưa
      const existingReview = await Review.findOne({
        user: userId,
        book: bookId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã đánh giá sách này rồi"
        });
      }

      // Tạo đánh giá mới
      const review = new Review({
        user: userId,
        book: bookId,
        rating,
        comment,
        status: "pending"
      });

      await review.save();

      // Cập nhật rating trung bình của sách
      const allReviews = await Review.find({
        book: bookId,
        status: "approved"
      });

      if (allReviews.length > 0) {
        const avgRating = allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length;
        await Product.findByIdAndUpdate(bookId, { rating: avgRating.toFixed(1) });
      }

      res.status(200).json({
        success: true,
        message: "Thêm đánh giá thành công, chờ duyệt",
        data: review
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi thêm đánh giá",
        error: error.message
      });
    }
  },

  // Lấy đánh giá của một sách
  getBookReviews: async (req, res) => {
    try {
      const { bookId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: "user"
      };

      const reviews = await Review.paginate(
        { book: bookId, status: "approved" },
        options
      );

      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách đánh giá",
        error: error.message
      });
    }
  },

  // Lấy tất cả đánh giá (cho admin)
  getAllReviews: async (req, res) => {
    try {
      const { status, page = 1, limit = 10 } = req.query;

      let query = {};
      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: ["user", "book"]
      };

      const reviews = await Review.paginate(query, options);

      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách đánh giá",
        error: error.message
      });
    }
  },

  // Duyệt đánh giá (cho admin)
  approveReview: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { status } = req.body;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá"
        });
      }

      review.status = status;
      await review.save();

      // Nếu duyệt/từ chối, cập nhật lại rating trung bình của sách
      if (status === "approved" || status === "rejected") {
        const approvedReviews = await Review.find({
          book: review.book,
          status: "approved"
        });

        if (approvedReviews.length > 0) {
          const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
          await Product.findByIdAndUpdate(review.book, { rating: avgRating.toFixed(1) });
        }
      }

      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái đánh giá thành công",
        data: review
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi duyệt đánh giá",
        error: error.message
      });
    }
  },

  // Xóa đánh giá
  deleteReview: async (req, res) => {
    try {
      const { reviewId } = req.params;

      const review = await Review.findById(reviewId);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy đánh giá"
        });
      }

      await review.remove();

      // Cập nhật lại rating trung bình của sách
      const approvedReviews = await Review.find({
        book: review.book,
        status: "approved"
      });

      if (approvedReviews.length > 0) {
        const avgRating = approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length;
        await Product.findByIdAndUpdate(review.book, { rating: avgRating.toFixed(1) });
      }

      res.status(200).json({
        success: true,
        message: "Xóa đánh giá thành công"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi xóa đánh giá",
        error: error.message
      });
    }
  }
};

module.exports = reviewController;