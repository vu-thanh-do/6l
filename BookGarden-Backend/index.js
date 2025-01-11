const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const app = express();
const DB_MONGO = require("./app/config/db.config");
const _CONST = require("./app/config/constant");
const nodemailer = require("nodemailer");
require("dotenv").config();
//router
const authRoute = require("./app/routers/auth");
const userRoute = require("./app/routers/user");
const productRoute = require("./app/routers/product");
const categoryRoute = require("./app/routers/category");
const authorRoute = require("./app/routers/author");
const pulisherRoute = require("./app/routers/pulisher");
const uploadFileRoute = require("./app/routers/uploadFile");
const orderRoute = require("./app/routers/order");
const statisticalRoute = require("./app/routers/statistical");
const paymentRoute = require("./app/routers/paypal");
const newsRoute = require("./app/routers/news");
const voucherRoute = require("./app/routers/voucher");

const complaintModel = require("./app/models/complaintModel");
const order = require("./app/models/order");
const vnpayRoute = require("./app/routers/vnpay");
const setting = require("./app/models/setting");
const product = require("./app/models/product");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public"));

mongoose
  .connect(DB_MONGO.URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB.");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/product", productRoute);
app.use("/api/category", categoryRoute);
app.use("/api/author", authorRoute);
app.use("/api/pulisher", pulisherRoute);
app.use("/api/uploadFile", uploadFileRoute);
app.use("/api/statistical", statisticalRoute);
app.use("/api/order", orderRoute);
app.use("/api/payment", paymentRoute);
app.use("/api/news", newsRoute);
app.use("/api", voucherRoute);
app.use("/api/vnpay", vnpayRoute);
app.use("/uploads", express.static("uploads"));
app.get("/api/set-time", async (req, res) => {
  try {
    const data = req.query.time;
    await setting.deleteMany();
    await setting.create({
      time: data,
    });
    return res.json("ok");
  } catch (error) {
    console.log(error);
  }
});
app.get("/api/get-time", async (req, res) => {
  try {
    const data = await setting.find({});

    return res.json(data[0]);
  } catch (error) {
    console.log(error);
  }
});
// sendEmailNotification();
app.get("/api/complaint/:id", async (req, res) => {
  try {
    const complaint = await complaintModel.findOne({
      orderId: req.params.orderId,
    });
    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy khiếu nại với đơn hàng này" });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu khiếu nại" });
  }
});
const updateVoucherTimes = async () => {
  try {
    const settings = await setting.find({ time: { $gt: 0 } });
    for (let setting of settings) {
      const now = new Date();
      const createDate = setting.createdAt;
      const diffInTime = now - createDate;
      const diffInDays = Math.floor(diffInTime / (1000 * 3600 * 24));
      let newTime = setting.time - diffInDays;
      if (newTime <= 0) {
        newTime = -1;
      }
      setting.time = newTime;
      await setting.save();
    }

    console.log("Đã cập nhật tất cả các bản ghi.");
  } catch (error) {
    console.error("Lỗi khi cập nhật: ", error);
  }
};
const checkTimeRemoveDiscount = async () => {
  try {
    const timeDate = await setting.find({});
    if (timeDate.length === 0) {
      console.log("Không có dữ liệu trong bảng settings");
      return;
    }
    const productData = await product.find({});
    if (productData.length === 0) {
      console.log("Không có dữ liệu trong bảng product");
      return;
    }
    const timeData = timeDate[0];
    const createDate = new Date(timeData.createdAt);
    const timeLimit = timeData.time; // Số ngày giới hạn
    const currentDate = new Date();
    console.log(createDate, "createDate");
    console.log(timeLimit, "timeLimit");
    console.log(currentDate, "currentDate");
    const timeDiff = Math.floor(
      (currentDate - createDate) / (1000 * 60 * 60 * 24)
    );

    if (timeDiff > timeLimit) {
      console.log("first");
      await product.updateMany({}, [
        {
          $set: {
            salePrice: "$price",
          },
        },
      ]);
    } else {
      console.log("Còn hạn");
    }
  } catch (error) {
    console.error("Lỗi:", error);
  }
};
setInterval(() => {
  checkTimeRemoveDiscount();
  updateVoucherTimes()
}, 5000);
app.get("/api/complaint", async (req, res) => {
  try {
    const complaint = await complaintModel
      .find({})
      .populate([{ path: "user" }, { path: "orderId" }]);
    if (!complaint) {
      return res.status(404).json({ message: "Không tìm thấy khiếu nại " });
    }
    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu khiếu nại" });
  }
});
app.post("/api/create-complaint", async (req, res) => {
  try {
    const complaint = await complaintModel.create(req.body);
    await order.findByIdAndUpdate(
      req.body.orderId,
      {
        $set: {
          status: "pendingcomplaint",
        },
      },
      {
        new: true,
      }
    );
    return res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/api/update-complaint/:id", async (req, res) => {
  try {
    const data = await complaintModel.findById(req.params.id).populate("user");
    const complaint = await complaintModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          status: req.query.status,
        },
      },
      {
        new: true,
      }
    );
    if (req.query.status) {
      await order.findByIdAndUpdate(
        data.orderId,
        {
          $set: {
            status: req.query.status,
          },
        },
        {
          new: true,
        }
      );
    }

    // Dịch trạng thái đơn hàng
    let statusDisplay;
    switch (req.query.status) {
      case "cancelcomplaint":
        statusDisplay = "Hủy khiếu nại";
        break;
      case "refundcomplaint":
        statusDisplay = "Đang hoàn trả";
        break;
      case "acceptcomplaint":
        statusDisplay = "Đã xác nhận";
        break;
      case "pendingcomplaint":
        statusDisplay = "Đang chờ";
        break;
      case "finalcomplaint":
        statusDisplay = "Đã hoàn thành";
        break;
      default:
        statusDisplay = req.query.status; // Nếu không có trạng thái nào khớp, giữ nguyên giá trị ban đầu
    }

    // Nội dung email thông báo
    const emailContent = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; border-radius: 8px; max-width: 700px; margin: auto; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #20c997; font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 20px;">Cập nhật trạng thái khiếu nại</h2>
    <p style="font-size: 16px; text-align: center; margin-bottom: 30px;">Xin chào <strong>${
      data.user.username || "Khách hàng"
    }</strong>, trạng thái khiếu nại của bạn đã được cập nhật. Dưới đây là chi tiết:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <thead>
        <tr style="background-color: #20c997; color: #fff; text-align: left;">
          <th style="padding: 12px; font-size: 16px;">Mã khiếu nại</th>
          <th style="padding: 12px; font-size: 16px;">Trạng thái hiện tại</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background-color: #f9f9f9;">
          <td style="padding: 12px; font-size: 16px;">${complaint._id}</td>
          <td style="padding: 12px; font-size: 16px;">${statusDisplay}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top: 20px; padding: 15px; background-color: #eafaf1; border-radius: 8px; text-align: center;">
      <p style="font-size: 16px; margin: 0;">Cảm ơn bạn đã tin tưởng dịch vụ của <strong>BookGarden</strong>!</p>
      <p style="font-size: 16px; font-weight: bold; margin: 5px 0;">Chúng tôi luôn sẵn sàng hỗ trợ bạn.</p>
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
      to: data.user.email,
      subject: "Cập nhật trạng thái khiếu nại",
      html: emailContent, // Dùng HTML với kiểu dáng inline
    };

    // Gửi email
    await transporter.sendMail(mailOptions);
    return res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || _CONST.PORT;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
