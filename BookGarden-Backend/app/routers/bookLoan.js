const router = require("express").Router();
const bookLoanController = require("../controllers/bookLoanController");
const verifyToken = require("../../utils/middleware");
const bookLoanStatisticsController = require("../controllers/bookLoanStatisticsController");

// Đăng ký mượn sách
router.post(
  "/borrow/:id",
  bookLoanController.borrowBook
);

// Lấy danh sách sách đã mượn của user
router.get(
  "/user/:userId",
  bookLoanController.getUserLoans
);

// Gia hạn mượn sách
router.post(
  "/extend/:loanId",
  bookLoanController.extendLoan
);

// Trả sách
router.post(
  "/return/:loanId",
  bookLoanController.returnBook
);

// Lấy danh sách tất cả phiếu mượn (admin)
router.get(
  "/all",
  bookLoanController.getAllLoans
);

// Duyệt yêu cầu mượn sách (admin)
router.put(
  "/approve/:loanId",
  bookLoanController.approveLoan
);
router.get("/stats/loan-return", bookLoanStatisticsController.getLoanReturnStats);
router.get("/stats/most-borrowed", bookLoanStatisticsController.getMostBorrowedBooks);
router.get("/stats/overall", bookLoanStatisticsController.getOverallStats);
module.exports = router; 