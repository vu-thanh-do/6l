const BookLoan = require("../models/bookLoan");
const Product = require("../models/product");
const moment = require("moment");

const bookLoanStatisticsController = {
  // Lấy thống kê mượn/trả theo tháng
  getLoanReturnStats: async (req, res) => {
    try {
      const { year, month } = req.query;
      const matchQuery = {};

      if (year) {
        matchQuery.createdAt = {
          $gte: moment().year(parseInt(year)).startOf("year").toDate(),
          $lte: moment().year(parseInt(year)).endOf("year").toDate(),
        };
      }

      if (month) {
        matchQuery.createdAt = {
          $gte: moment().year(parseInt(year)).month(parseInt(month) - 1).startOf("month").toDate(),
          $lte: moment().year(parseInt(year)).month(parseInt(month) - 1).endOf("month").toDate(),
        };
      }

      const stats = await BookLoan.aggregate([
        { $match: matchQuery },
        {
          $project: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
            status: 1,
            books: 1,
            totalBorrowFee: 1,
            depositFee: 1,
            shippingFee: 1,
            totalAmount: 1
          }
        },
        {
          $group: {
            _id: {
              month: "$month",
              year: "$year",
              status: "$status"
            },
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
          }
        },
        {
          $project: {
            _id: 0,
            month: "$_id.month",
            year: "$_id.year",
            status: "$_id.status",
            count: 1,
            totalRevenue: 1
          }
        }
      ]);

      // Format dữ liệu cho biểu đồ
      const formattedStats = stats.map(stat => ({
        month: `Tháng ${stat.month}/${stat.year}`,
        type: stat.status === "returned" ? "Trả" : 
              stat.status === "overdue" ? "Quá hạn" : "Mượn",
        value: stat.count,
        revenue: stat.totalRevenue
      }));

      res.status(200).json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy thống kê mượn/trả",
        error: error.message
      });
    }
  },

  // Lấy thống kê sách mượn nhiều nhất
  getMostBorrowedBooks: async (req, res) => {
    try {
      const stats = await BookLoan.aggregate([
        { $unwind: "$books" },
        {
          $group: {
            _id: "$books.id",
            bookName: { $first: "$books.name" },
            totalBorrows: { $sum: 1 },
            totalRevenue: { $sum: "$books.borrowFee" }
          }
        },
        { $sort: { totalBorrows: -1 } },
        { $limit: 10 }
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

  // Lấy thống kê tổng quan
  getOverallStats: async (req, res) => {
    try {
      const stats = await BookLoan.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" }
          }
        }
      ]);

      const totalLoans = stats.reduce((sum, stat) => sum + stat.count, 0);
      const totalReturned = stats.find(stat => stat._id === "returned")?.count || 0;
      const totalOverdue = stats.find(stat => stat._id === "overdue")?.count || 0;
      const totalPending = stats.find(stat => stat._id === "pending")?.count || 0;
      const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);

      res.status(200).json({
        success: true,
        data: {
          totalLoans,
          totalReturned,
          totalOverdue,
          totalPending,
          returnRate: totalLoans > 0 ? Math.round((totalReturned / totalLoans) * 100) : 0,
          totalRevenue
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