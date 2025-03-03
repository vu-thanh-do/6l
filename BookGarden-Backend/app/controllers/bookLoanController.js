const BookLoan = require("../models/bookLoan");
const Product = require("../models/product");
const nodemailer = require("nodemailer");
require("dotenv").config();

const bookLoanController = {
  // Đăng ký mượn sách
  borrowBook: async (req, res) => {
    try {
      const { userId, bookId, dueDate } = req.body;

      // Kiểm tra số lượng sách còn
      const book = await Product.findById(bookId);
      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sách"
        });
      }

      if (book.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: "Sách đã hết, không thể mượn"
        });
      }

      // Kiểm tra người dùng có đang mượn quá 3 cuốn không
      const activeLoans = await BookLoan.countDocuments({
        user: userId,
        status: { $in: ["pending", "borrowed", "extended"] }
      });

      if (activeLoans >= 3) {
        return res.status(400).json({
          success: false,
          message: "Bạn đã mượn tối đa 3 cuốn sách"
        });
      }

      // Tạo phiếu mượn mới
      const loan = new BookLoan({
        user: userId,
        book: bookId,
        dueDate: new Date(dueDate),
        status: "pending"
      });

      await loan.save();

      // Giảm số lượng sách
      book.stock -= 1;
      await book.save();

      res.status(200).json({
        success: true,
        message: "Đăng ký mượn sách thành công",
        data: loan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi đăng ký mượn sách",
        error: error.message
      });
    }
  },

  // Lấy danh sách sách đã mượn của user
  getUserLoans: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status } = req.query;

      let query = { user: userId };
      if (status) {
        query.status = status;
      }

      const loans = await BookLoan.find(query)
        .populate("book")
        .populate("user")
        .sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: loans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách sách đã mượn",
        error: error.message
      });
    }
  },

  // Gia hạn mượn sách
  extendLoan: async (req, res) => {
    try {
      const { loanId } = req.params;
      const { newDueDate } = req.body;

      const loan = await BookLoan.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn"
        });
      }

      // Kiểm tra điều kiện gia hạn
      if (loan.status !== "borrowed") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể gia hạn sách đang mượn"
        });
      }

      if (loan.extensionCount >= 2) {
        return res.status(400).json({
          success: false,
          message: "Đã vượt quá số lần gia hạn cho phép"
        });
      }

      // Cập nhật thông tin gia hạn
      loan.dueDate = new Date(newDueDate);
      loan.extensionCount += 1;
      loan.status = "extended";
      await loan.save();

      res.status(200).json({
        success: true,
        message: "Gia hạn mượn sách thành công",
        data: loan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi gia hạn mượn sách",
        error: error.message
      });
    }
  },

  // Trả sách
  returnBook: async (req, res) => {
    try {
      const { loanId } = req.params;

      const loan = await BookLoan.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn"
        });
      }

      if (loan.status === "returned") {
        return res.status(400).json({
          success: false,
          message: "Sách đã được trả"
        });
      }

      // Cập nhật trạng thái phiếu mượn
      loan.status = "returned";
      loan.returnDate = new Date();
      await loan.save();

      // Tăng số lượng sách
      const book = await Product.findById(loan.book);
      book.stock += 1;
      await book.save();

      // Gửi email thông báo
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: loan.user.email,
        subject: "Xác nhận trả sách",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Xác nhận trả sách thành công</h2>
            <p>Cảm ơn bạn đã trả sách đúng hạn.</p>
            <p>Thông tin chi tiết:</p>
            <ul>
              <li>Tên sách: ${book.name}</li>
              <li>Ngày mượn: ${new Date(loan.borrowDate).toLocaleDateString()}</li>
              <li>Ngày trả: ${new Date(loan.returnDate).toLocaleDateString()}</li>
            </ul>
          </div>
        `
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Trả sách thành công",
        data: loan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi trả sách",
        error: error.message
      });
    }
  },

  // Lấy danh sách tất cả phiếu mượn (cho admin)
  getAllLoans: async (req, res) => {
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
        populate: ["book", "user"]
      };

      const loans = await BookLoan.paginate(query, options);

      res.status(200).json({
        success: true,
        data: loans
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi lấy danh sách phiếu mượn",
        error: error.message
      });
    }
  },

  // Duyệt yêu cầu mượn sách
  approveLoan: async (req, res) => {
    try {
      const { loanId } = req.params;
      const { status } = req.body;

      const loan = await BookLoan.findById(loanId);
      if (!loan) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy phiếu mượn"
        });
      }

      if (loan.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: "Chỉ có thể duyệt phiếu mượn đang chờ xử lý"
        });
      }

      loan.status = status;
      if (status === "borrowed") {
        loan.borrowDate = new Date();
      }
      await loan.save();

      res.status(200).json({
        success: true,
        message: "Cập nhật trạng thái phiếu mượn thành công",
        data: loan
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Lỗi khi duyệt phiếu mượn",
        error: error.message
      });
    }
  }
};

module.exports = bookLoanController; 