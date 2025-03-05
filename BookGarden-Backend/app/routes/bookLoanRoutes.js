const express = require("express");
const router = express.Router();
const bookLoanController = require("../controllers/bookLoanController");
const bookLoanStatisticsController = require("../controllers/bookLoanStatisticsController");
const { verifyToken } = require("../middleware/auth");

// Routes cho người dùng
router.post("/borrow/:id", verifyToken, bookLoanController.borrowBook);
router.get("/user/:userId", verifyToken, bookLoanController.getUserLoans);
router.post("/extend/:loanId", verifyToken, bookLoanController.extendLoan);
router.post("/return/:loanId", verifyToken, bookLoanController.returnBook);

// Routes cho admin
router.get("/admin", verifyToken, bookLoanController.getAllLoans);
router.put("/admin/:loanId", verifyToken, bookLoanController.approveLoan);

// Routes thống kê
router.get("/stats/loan-return", verifyToken, bookLoanStatisticsController.getLoanReturnStats);
router.get("/stats/most-borrowed", verifyToken, bookLoanStatisticsController.getMostBorrowedBooks);
router.get("/stats/overall", verifyToken, bookLoanStatisticsController.getOverallStats);

module.exports = router; 