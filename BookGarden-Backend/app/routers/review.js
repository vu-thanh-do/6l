const router = require("express").Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../../utils/middleware");

// Thêm đánh giá mới
router.post(
  "/add",
  verifyToken.checkLogin,
  reviewController.addReview
);

// Lấy đánh giá của một sách
router.get(
  "/book/:bookId",
  reviewController.getBookReviews
);

// Lấy tất cả đánh giá (admin)
router.get(
  "/all",
  verifyToken.checkLogin,
  reviewController.getAllReviews
);

// Duyệt đánh giá (admin)
router.put(
  "/approve/:reviewId",
  verifyToken.checkLogin,
  reviewController.approveReview
);

// Xóa đánh giá
router.delete(
  "/:reviewId",
  verifyToken.checkLogin,
  reviewController.deleteReview
);

module.exports = router; 