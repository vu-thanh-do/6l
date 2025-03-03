const router = require("express").Router();
const bookLoanController = require("../controllers/bookLoanController");
const verifyToken = require("../../utils/middleware");

// Đăng ký mượn sách
router.post(
  "/borrow",
  verifyToken.checkLogin,
  bookLoanController.borrowBook
);

// Lấy danh sách sách đã mượn của user
router.get(
  "/user/:userId",
  verifyToken.checkLogin,
  bookLoanController.getUserLoans
);

// Gia hạn mượn sách
router.put(
  "/extend/:loanId",
  verifyToken.checkLogin,
  bookLoanController.extendLoan
);

// Trả sách
router.put(
  "/return/:loanId",
  verifyToken.checkLogin,
  bookLoanController.returnBook
);

// Lấy danh sách tất cả phiếu mượn (admin)
router.get(
  "/all",
  verifyToken.checkLogin,
  bookLoanController.getAllLoans
);

// Duyệt yêu cầu mượn sách (admin)
router.put(
  "/approve/:loanId",
  verifyToken.checkLogin,
  bookLoanController.approveLoan
);

module.exports = router; 