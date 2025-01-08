const OrderModel = require("../models/order");
const _const = require("../config/constant");
const jwt = require("jsonwebtoken");
const Product = require("../models/product");
const User = require("../models/user");
const nodemailer = require("nodemailer");
const juice = require("juice");

require("dotenv").config();

const orderController = {
  getAllOrder: async (req, res) => {
    try {
      const page = req.body.page || 1;
      const limit = req.body.limit || 10;

      const options = {
        page: page,
        limit: limit,
        populate: "user",
      };

      const orderList = await OrderModel.paginate({}, options);
      res.status(200).json({ data: orderList });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getOrderById: async (req, res) => {
    try {
      const data = await OrderModel.findById(req.params.id).populate({
        path: "products.product",
      });
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createOrder: async (req, res) => {
    try {
      const insufficientStockProducts = [];

      // Tạo đơn hàng mới mà không cần cung cấp mã đơn hàng vì MongoDB sẽ tự động tạo _id
      const order = new OrderModel({
        user: req.body.userId,
        products: req.body.products,
        description: req.body.description,
        orderTotal: req.body.orderTotal,
        billing: req.body.billing,
        address: req.body.address,
        status: req.body.status,
      });

      // Kiểm tra tồn kho sản phẩm
      for (const productItem of req.body.products) {
        const productId = productItem.product;
        const stock = productItem.stock;

        // Tìm sản phẩm trong cơ sở dữ liệu
        const product = await Product.findById(productId);

        if (!product || product.stock < stock) {
          insufficientStockProducts.push({
            productId,
            stock: product ? product.stock : 0,
          });
        }

        if (insufficientStockProducts.length > 0) {
          return res.status(200).json({
            error: "Insufficient stock for one or more products.",
            insufficientStockProducts,
          });
        }

        // Cập nhật tồn kho sản phẩm
        if (product) {
          product.stock -= stock;
          await product.save();
        }
      }

      // Lưu đơn hàng mới vào cơ sở dữ liệu
      const orderList = await order.save();

      // Lấy thông tin người dùng
      const user = await User.findById(req.body.userId);
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }

      // Soạn danh sách sản phẩm cho email
      const productDetails = await Promise.all(
        req.body.products.map(async (productItem) => {
          const product = await Product.findById(productItem.product);
          return `
      <tr>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: left; font-size: 16px;">${product.name}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: left; font-size: 16px;">${productItem.stock}</td>
        <td style="padding: 12px; border: 1px solid #ddd; text-align: right; font-size: 16px;">${req.body.orderTotal}</td>
      </tr>
    `;
        })
      );

      // Soạn email thông báo
      const rawEmailContent = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 700px; margin: auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #20c997; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px;">Cảm ơn bạn đã đặt hàng tại BookGarden!</h2>
        <p style="font-size: 16px; text-align: center; margin-bottom: 30px;">Xin chào <strong>${
          user.username || "Khách hàng"
        }</strong>, đơn hàng của bạn đã được xác nhận. Dưới đây là chi tiết đơn hàng:</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
          <thead>
            <tr style="background-color: #20c997; color: #fff; text-align: left;">
              <th style="padding: 12px; font-size: 16px;">Sản phẩm</th>
              <th style="padding: 12px; font-size: 16px;">Số lượng</th>
              <th style="padding: 12px; font-size: 16px; text-align: right;">Tổng giá trị</th>
            </tr>
          </thead>
          <tbody>
            ${productDetails.join("")}
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 12px; font-size: 14px; font-weight: bold;">Mã đơn hàng:</td>
              <td></td>
              <td style="padding: 12px; font-size: 14px; text-align: right;">${
                orderList._id
              }</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-size: 14px; font-weight: bold;">Địa chỉ giao hàng:</td>
              <td></td>
              <td style="padding: 12px; font-size: 14px; text-align: right;">${
                req.body.address
              }</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 12px; font-size: 14px; font-weight: bold;">Phương thức thanh toán:</td>
              <td></td>
              <td style="padding: 12px; font-size: 14px; text-align: right;">${
                req.body.billing
              }</td>
            </tr>
          </tbody>
        </table>
    
        <div style="margin-top: 20px; padding: 15px; background-color: #eafaf1; border-radius: 8px; text-align: center;">
          <p style="font-size: 16px; margin: 0;">Cảm ơn bạn đã tin tưởng mua sắm tại <strong>BookGarden</strong>!</p>
          <p style="font-size: 16px; font-weight: bold; margin: 5px 0;">Chúc bạn một ngày tuyệt vời!</p>
        </div>
    
        <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #555;">
          <p style="margin: 5px 0;">BookGarden - Cửa hàng sách yêu thương</p>
          <p style="margin: 5px 0;">Hotline: 1900 123 456 | Email: dotuanduong287@gmail.com</p>
        </footer>
      </div>
    `;

      const emailContent = juice(rawEmailContent); // Inline CSS using Juice

      // Cấu hình Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Xác nhận đặt hàng thành công",
        html: emailContent, // Use HTML with inline styles
      };

      // Gửi email
      await transporter.sendMail(mailOptions);

      // Trả về phản hồi thành công
      res.status(200).json(orderList);
    } catch (err) {
      console.error(err);
      res.status(500).json(err);
    }
  },

  deleteOrder: async (req, res) => {
    try {
      const orderList = await OrderModel.findByIdAndDelete(req.params.id);
      if (!orderList) {
        return res.status(200).json("Order does not exist");
      }
      res.status(200).json("Delete order success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateOrder: async (req, res) => {
    const id = req.params.id;
    const { status, description, address } = req.body;

    try {
      // Cập nhật trạng thái đơn hàng
      const order = await OrderModel.findByIdAndUpdate(
        id,
        { status, description, address },
        { new: true }
      ).populate("user"); // Lấy thông tin người dùng liên quan

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Lấy thông tin người dùng
      const user = order.user;
      if (!user || !user.email) {
        return res.status(400).json({ message: "User email not found" });
      }
      let statusDisplay;
      switch (status) {
        case "confirmed":
          statusDisplay = "Đã xác nhận";
          break;
        case "shipping":
          statusDisplay = "Đang vận chuyển";
          break;
        case "shipped successfully":
          statusDisplay = "Đã giao thành công";
          break;
        case "final":
          statusDisplay = "Hoàn thành";
          break;
        case "rejected":
          statusDisplay = "Đã hủy";
          break;
        default:
          statusDisplay = status; // Nếu không có trạng thái nào khớp, giữ nguyên giá trị ban đầu
      }
      // Soạn nội dung email thông báo
      const emailContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 700px; margin: auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #20c997; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px;">Cập nhật trạng thái đơn hàng</h2>
    <p style="font-size: 16px; text-align: center; margin-bottom: 30px;">Xin chào <strong>${
      user.username || "Khách hàng"
    }</strong>, trạng thái đơn hàng của bạn đã được cập nhật. Dưới đây là chi tiết:</p>
    
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <thead>
        <tr style="background-color: #20c997; color: #fff; text-align: left;">
          <th style="padding: 12px; font-size: 16px;">Mã đơn hàng</th>
          <th style="padding: 12px; font-size: 16px;">Trạng thái hiện tại</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 12px; font-size: 16px;">${order._id}</td>
          <td style="padding: 12px; font-size: 16px;">${statusDisplay}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 15px; background-color: #eafaf1; border-radius: 8px; text-align: center;">
      <p style="font-size: 16px; margin: 0;">Cảm ơn bạn đã sử dụng dịch vụ của <strong>BookGarden</strong>!</p>
      <p style="font-size: 16px; font-weight: bold; margin: 5px 0;">Chúc bạn một ngày tuyệt vời!</p>
    </div>

    <footer style="margin-top: 30px; text-align: center; font-size: 14px; color: #555;">
      <p style="margin: 5px 0;">BookGarden - Cửa hàng sách yêu thương</p>
      <p style="margin: 5px 0;">Hotline: 1900 123 456 | Email: dotuanduong287@gmail.com</p>
    </footer>
  </div>
      `;

      // Cấu hình Nodemailer
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER, // Đọc email từ biến môi trường
          pass: process.env.EMAIL_PASS, // Đọc mật khẩu từ biến môi trường
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "Cập nhật trạng thái đơn hàng",
        html: emailContent, // Use HTML with inline styles
      };

      // Gửi email
      await transporter.sendMail(mailOptions);

      // Trả về phản hồi thành công
      res.status(200).json(order);
    } catch (err) {
      console.error("Error updating order:", err.message);
      res.status(500).json(err);
    }
  },

  searchOrderByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
      populate: "user",
    };

    const name = req.query.name;

    try {
      const orderList = await OrderModel.paginate(
        { billing: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: orderList });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getOrderByUser: async (req, res) => {
    try {
      const decodedToken = jwt.verify(
        req.headers.authorization,
        _const.JWT_ACCESS_KEY
      );
      const orders = await OrderModel.find({
        user: decodedToken.user._id,
      }).populate("products.product");
      res.status(200).json({ data: orders });
    } catch (err) {
      res.status(401).send("Unauthorized");
    }
  },
};

module.exports = orderController;
