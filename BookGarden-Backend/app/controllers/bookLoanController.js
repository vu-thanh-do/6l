const BookLoan = require("../models/bookLoan");
const Product = require("../models/product");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require("moment");

const bookLoanController = {
  // Đăng ký mượn sách
  borrowBook: async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        books, 
        deliveryMethod,
        shippingAddress,
        shippingFee = 0
      } = req.body;

      // Kiểm tra số lượng sách mượn
      if (books.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Bạn chỉ được mượn tối đa 3 cuốn sách"
        });
      }

      // Kiểm tra người dùng có đang mượn quá 3 cuốn không
      const activeLoans = await BookLoan.find({
        user: id,
        status: { $in: ["pending", "borrowed", "extended"] }
      });

      const activeBooksCount = activeLoans.reduce((total, loan) => total + loan.totalBooks, 0);
      if (activeBooksCount + books.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Bạn chỉ được mượn tối đa 5 cuốn sách cùng lúc"
        });
      }

      // Kiểm tra số lượng sách còn và tính tổng tiền
      const totalBorrowFee = books.reduce((total, book) => total + book.borrowFee, 0);
      const depositFee = books.reduce((total, book) => total + book.price, 0);

      // Kiểm tra và cập nhật số lượng sách trong kho
      for (const bookItem of books) {
        const bookInStock = await Product.findById(bookItem.id);
        if (!bookInStock) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sách "${bookItem.name}"`
          });
        }

        if (bookInStock.stock <= 0) {
          return res.status(400).json({
            success: false,
            message: `Sách "${bookItem.name}" đã hết, không thể mượn`
          });
        }

        // Cập nhật số lượng sách
        bookInStock.stock -= 1;
        await bookInStock.save();
      }

      // Tạo phiếu mượn mới
      const newLoan = new BookLoan({
        user: id,
        books,
        totalBooks: books.length,
        totalBorrowFee,
        depositFee,
        deliveryMethod,
        totalAmount: totalBorrowFee + depositFee + shippingFee
      });

      // Thêm thông tin giao hàng nếu có
      if (deliveryMethod === "shipping") {
        newLoan.shippingAddress = shippingAddress;
        newLoan.shippingFee = shippingFee;
      }

      await newLoan.save();

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
        to: "thanhdo9xi@gmail.com",
        subject: "Đăng ký mượn sách thành công",
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>Xác nhận đăng ký mượn sách</h2>
            <p>Cảm ơn bạn đã đăng ký mượn sách. Vui lòng chờ thủ thư duyệt yêu cầu.</p>
            <p>Thông tin chi tiết:</p>
            <ul>
              <li>Số lượng sách: ${books.length} cuốn</li>
              <li>Phí mượn: ${totalBorrowFee.toLocaleString()}đ</li>
              <li>Tiền đặt cọc: ${depositFee.toLocaleString()}đ</li>
              ${deliveryMethod === "shipping" ? `<li>Phí vận chuyển: ${shippingFee.toLocaleString()}đ</li>` : ''}
              <li>Tổng tiền: ${newLoan.totalAmount.toLocaleString()}đ</li>
            </ul>
            ${deliveryMethod === "shipping" ? `
            <p>Địa chỉ giao hàng:</p>
            <ul>
              <li>${shippingAddress.address}</li>
              <li>${shippingAddress.ward}, ${shippingAddress.district}</li>
              <li>${shippingAddress.province}</li>
            </ul>
            ` : '<p>Phương thức nhận: Tại thư viện</p>'}
            <p>Danh sách sách mượn:</p>
            <ul>
              ${books.map(book => `
                <li>
                  ${book.name} (${book.borrowDays} ngày - ${book.borrowFee.toLocaleString()}đ)
                </li>
              `).join('')}
            </ul>
          </div>
        `
      };

      // await transporter.sendMail(mailOptions);

      res.status(200).json({
        success: true,
        message: "Đăng ký mượn sách thành công",
        data: newLoan
      });

    } catch (error) {
      // Rollback số lượng sách nếu có lỗi
      if (req.body.books) {
        for (const bookItem of req.body.books) {
          try {
            const book = await Product.findById(bookItem.id);
            if (book) {
              book.stock += 1;
              await book.save();
            }
          } catch (rollbackError) {
            console.error("Lỗi khi rollback số lượng sách:", rollbackError);
          }
        }
      }

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
      const { status, page = 1, limit = 10 } = req.query;

      let query = { user: userId };
      if (status) {
        query.status = status;
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
        populate: [
          {
            path: "user",
            select: "name email phone"
          }
        ]
      };
      const loans = await BookLoan.paginate(query, options);
      // Tính toán thêm các thông tin cần thiết cho frontend
      const formattedLoans = {
        ...loans,
        docs: loans.docs.map(loan => ({
          _id: loan._id,
          books: loan.books.map(book => ({
            ...book.toObject(),
            dueDate: book.dueDate ? moment(book.dueDate).format("DD/MM/YYYY") : null
          })),
          totalBooks: loan.totalBooks,
          totalBorrowFee: loan.totalBorrowFee,
          depositFee: loan.depositFee,
          deliveryMethod: loan.deliveryMethod,
          shippingAddress: loan.shippingAddress,
          shippingFee: loan.shippingFee,
          totalAmount: loan.totalAmount,
          borrowDate: loan.borrowDate ? moment(loan.borrowDate).format("DD/MM/YYYY") : null,
          returnDate: loan.returnDate ? moment(loan.returnDate).format("DD/MM/YYYY") : null,
          status: loan.status,
          extensionCount: loan.extensionCount,
          note: loan.note,
          createdAt: moment(loan.createdAt).format("DD/MM/YYYY HH:mm"),
          // Thêm các trường tính toán
          isOverdue: loan.status !== "returned" && loan.books.some(book => 
            moment().isAfter(book.dueDate)
          ),
          canExtend: loan.status === "borrowed" && loan.extensionCount < 2,
          canReturn: ["borrowed", "extended"].includes(loan.status),
          remainingDays: loan.status !== "returned" ? 
            Math.min(...loan.books.map(book => 
              moment(book.dueDate).diff(moment(), 'days')
            )) : 0
        }))
      };

      res.status(200).json({
        success: true,
        data: formattedLoans
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

      // Kiểm tra ngày gia hạn hợp lệ
      const latestDueDate = moment.max(
        loan.books.map(book => moment(book.dueDate))
      );
      const newDueDateMoment = moment(newDueDate);

      // Kiểm tra ngày gia hạn không được là ngày quá khứ
      if (newDueDateMoment.isBefore(moment(), 'day')) {
        return res.status(400).json({
          success: false,
          message: "Ngày gia hạn không được là ngày quá khứ"
        });
      }

      // Tính số ngày gia hạn
      const extensionDays = newDueDateMoment.diff(latestDueDate, 'days');

      // Nếu trả sớm (extensionDays < 0)
      if (extensionDays < 0) {
        // Tính số tiền được trừ (3000đ/ngày/cuốn)
        const refundAmount = Math.abs(extensionDays) * 3000 * loan.books.length;
        
        // Cập nhật ngày trả và phí cho từng cuốn sách
        loan.books = loan.books.map(book => ({
          ...book,
          dueDate: newDueDateMoment.toDate(),
          status: "extended",
          borrowDays: book.borrowDays + extensionDays,
          borrowFee: Math.max(0, book.borrowFee - (Math.abs(extensionDays) * 3000))
        }));

        // Cập nhật tổng phí mượn và tổng tiền
        loan.totalBorrowFee = Math.max(0, loan.totalBorrowFee - refundAmount);
        loan.totalAmount = loan.totalBorrowFee + loan.depositFee + (loan.shippingFee || 0);
      } else {
        // Nếu gia hạn thêm ngày
        const extensionFee = extensionDays * 3000 * loan.books.length;

        // Cập nhật ngày trả và phí cho từng cuốn sách
        loan.books = loan.books.map(book => ({
          ...book,
          dueDate: newDueDateMoment.toDate(),
          status: "extended",
          borrowDays: book.borrowDays + extensionDays,
          borrowFee: book.borrowFee + (extensionDays * 3000)
        }));

        // Cập nhật tổng phí mượn và tổng tiền
        loan.totalBorrowFee += extensionFee;
        loan.totalAmount += extensionFee;
      }

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

      // Cập nhật trạng thái từng cuốn sách
      loan.books = loan.books.map(book => ({
        ...book,
        status: "returned"
      }));

      // Tăng số lượng sách trong kho
      await Promise.all(loan.books.map(async (book) => {
        const bookInStock = await Product.findById(book.id);
        if (bookInStock) {
          bookInStock.stock += 1;
          await bookInStock.save();
        }
      }));

      await loan.save();

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
            <p>Cảm ơn bạn đã trả sách.</p>
            <p>Thông tin chi tiết:</p>
            <ul>
              <li>Danh sách sách:</li>
              ${loan.books.map(book => `
                <li>${book.name}</li>
              `).join('')}
              <li>Ngày mượn: ${moment(loan.borrowDate).format("DD/MM/YYYY")}</li>
              <li>Ngày trả: ${moment(loan.returnDate).format("DD/MM/YYYY")}</li>
            </ul>
          </div>
        `
      };

      // await transporter.sendMail(mailOptions);

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
        populate: [
          {
            path: "user",
            select: "name email phone"
          }
        ]
      };

      const loans = await BookLoan.paginate(query, options);

      // Format dữ liệu trả về
      const formattedLoans = {
        ...loans,
        docs: loans.docs.map(loan => ({
          _id: loan._id,
          user: loan.user,
          books: loan.books.map(book => ({
            _id: book._id,
            name: book.name,
            price: book.price,
            borrowDays: book.borrowDays,
            borrowFee: book.borrowFee,
            dueDate: book.dueDate,
            status: book.status
          })),
          totalBooks: loan.books.length,
          totalBorrowFee: loan.totalBorrowFee,
          depositFee: loan.depositFee,
          shippingFee: loan.shippingFee,
          totalAmount: loan.totalAmount,
          deliveryMethod: loan.deliveryMethod,
          shippingAddress: loan.shippingAddress,
          status: loan.status,
          createdAt: loan.createdAt,
          borrowDate: loan.borrowDate,
          isOverdue: loan.books.some(book => moment(book.dueDate).isBefore(moment(), "day")),
          canExtend: loan.status === "borrowed" && loan.extensionCount < 2,
          canReturn: loan.status === "borrowed",
          remainingDays: loan.status === "returned" ? null : 
            Math.min(...loan.books.map(book => moment(book.dueDate).diff(moment(), "days")))
        }))
      };

      res.status(200).json({
        success: true,
        data: formattedLoans
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
      const { status, borrowDate } = req.body;

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

      // Cập nhật trạng thái và ngày mượn
      loan.status = status;
      if (status === "borrowed") {
        // Sử dụng ngày mượn từ request hoặc ngày hiện tại
        loan.borrowDate = borrowDate ? new Date(borrowDate) : new Date();
        
        // Cập nhật ngày trả cho từng cuốn sách
        const updatedBooks = await Promise.all(loan.books.map(async (book) => {
          // Lấy thông tin sách từ Product
          const bookInStock = await Product.findById(book.id);
          if (!bookInStock) {
            throw new Error(`Không tìm thấy sách với ID: ${book.id}`);
          }

          const dueDate = moment(loan.borrowDate)
            .add(book.borrowDays, 'days')
            .toDate();

          return {
            id: book.id,
            name: bookInStock.name,
            price: bookInStock.price,
            image: bookInStock.image,
            category: bookInStock.category,
            borrowDays: book.borrowDays,
            borrowFee: book.borrowFee,
            dueDate,
            status: "borrowed"
          };
        }));

        loan.books = updatedBooks;
      }

      // Lưu phiếu mượn
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