const router = require("express").Router();
const bookLoanStatisticsController = require("../controllers/bookLoanStatisticsController");
const verifyToken = require("../../utils/middleware");

// Thống kê số lượng mượn/trả theo tháng, năm
router.get(
  "/loan-return-stats",
  verifyToken.checkLogin,
  bookLoanStatisticsController.getLoanReturnStats
);

// Thống kê sách được mượn nhiều nhất
router.get(
  "/most-borrowed",
  verifyToken.checkLogin,
  bookLoanStatisticsController.getMostBorrowedBooks
);

// Thống kê tổng quan
router.get(
  "/overall",
  verifyToken.checkLogin,
  bookLoanStatisticsController.getOverallStats
);

module.exports = router; 