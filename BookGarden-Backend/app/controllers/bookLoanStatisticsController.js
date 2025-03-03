const BookLoan = require("../models/bookLoan");
const Product = require("../models/product");

const bookLoanStatisticsController = {
  // Thống kê số lượng sách mượn/trả theo tháng, năm
  getLoanReturnStats: async (req, res) => {
    try {
      const { year, month } = req.query;
      let matchQuery = {};
      
      // Nếu có year và month thì lọc theo tháng/năm cụ thể
      if (year && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        matchQuery = {
          borrowDate: {
            $gte: startDate,
            $lte: endDate
          }
        };
      }
      // Nếu chỉ có year thì lọc theo năm
      else if (year) {
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        matchQuery = {
          borrowDate: {
            $gte: startDate,
            $lte: endDate
          }
        };
      }

      const stats = await BookLoan.aggregate([
        {
          $match: matchQuery
        },
        {
          $group: {
            _id: {
              year: { $year: "$borrowDate" },
              month: { $month: "$borrowDate" }
            },
            totalBorrowed: { $sum: 1 },
            totalReturned: {
              $sum: {
                $cond: [{ $eq: ["$status", "returned"] }, 1, 0]
              }
            },
            totalOverdue: {
              $sum: {
                $cond: [{ $eq: ["$status", "overdue"] }, 1, 0]
              }
            }
          }
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê mượn/trả sách",
        error: error.message
      });
    }
  },

  // Thống kê top sách được mượn nhiều nhất
  getMostBorrowedBooks: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const stats = await BookLoan.aggregate([
        {
          $group: {
            _id: "$book",
            totalBorrows: { $sum: 1 }
          }
        },
        {
          $sort: { totalBorrows: -1 }
        },
        {
          $limit: parseInt(limit)
        },
        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "bookDetails"
          }
        },
        {
          $unwind: "$bookDetails"
        },
        {
          $project: {
            _id: 1,
            totalBorrows: 1,
            bookName: "$bookDetails.name",
            author: "$bookDetails.author",
            category: "$bookDetails.category"
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê sách mượn nhiều nhất",
        error: error.message
      });
    }
  },

  // Thống kê tổng quan
  getOverallStats: async (req, res) => {
    try {
      const totalLoans = await BookLoan.countDocuments();
      const totalReturned = await BookLoan.countDocuments({ status: "returned" });
      const totalOverdue = await BookLoan.countDocuments({ status: "overdue" });
      const totalPending = await BookLoan.countDocuments({ status: "pending" });
      
      // Tính tỷ lệ trả sách đúng hạn
      const returnRate = totalReturned > 0 ? 
        ((totalReturned / (totalReturned + totalOverdue)) * 100).toFixed(2) : 0;

      res.status(200).json({
        success: true,
        data: {
          totalLoans,
          totalReturned,
          totalOverdue,
          totalPending,
          returnRate
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê tổng quan",
        error: error.message
      });
    }
  }
};

module.exports = bookLoanStatisticsController; 