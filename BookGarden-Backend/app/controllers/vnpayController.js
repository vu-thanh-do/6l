const crypto = require("crypto");
const moment = require("moment");
const axios = require("axios");
const querystring = require("querystring");

class VNPayController {
  // Tạo URL thanh toán
  async createPaymentUrl(req, res) {
    try {
      const ipAddr =
        req.headers["x-forwarded-for"] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress;

      const tmnCode = process.env.VNPAY_TMNCODE;
      const secretKey = process.env.VNPAY_SECRETKEY;
      const vnpUrl = process.env.VNPAY_URL;
      const returnUrl = process.env.VNPAY_RETURN_URL;

      const date = new Date();
      const createDate = moment(date).format("YYYYMMDDHHmmss");
      const orderId = moment(date).format("HHmmss");
      const amount = req.body.amount;
      const bankCode = req.body.bankCode || "";
      const orderInfo = req.body.orderDescription || "Thanh toan don hang";
      const orderType = req.body.orderType || "billpayment";
      const locale = req.body.language || "vn";

      const currCode = "VND";
      let vnp_Params = {
        vnp_Version: "2.1.0",
        vnp_Command: "pay",
        vnp_TmnCode: tmnCode,
        vnp_Locale: locale,
        vnp_CurrCode: currCode,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderInfo,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: returnUrl,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (bankCode) {
        vnp_Params.vnp_BankCode = bankCode;
      }

      // Sắp xếp các tham số theo thứ tự alphabet
      const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((result, key) => {
          result[key] = vnp_Params[key];
          return result;
        }, {});

      // Tạo chuỗi hash
      const signData = querystring.stringify(sortedParams);
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac
        .update(new Buffer.from(signData, "utf-8"))
        .digest("hex");

      // Thêm chữ ký vào params
      sortedParams["vnp_SecureHash"] = signed;

      // Tạo URL thanh toán
      const paymentUrl = vnpUrl + "?" + querystring.stringify(sortedParams);

      return res.status(200).json({
        status: "OK",
        message: "Tạo URL thanh toán thành công",
        paymentUrl,
      });
    } catch (error) {
      return res.status(500).json({
        status: "ERROR",
        message: error.message,
      });
    }
  }

  // Kiểm tra kết quả thanh toán
  async vnpayIPN(req, res) {
    try {
      const vnp_Params = req.query;
      const secureHash = vnp_Params["vnp_SecureHash"];

      delete vnp_Params["vnp_SecureHash"];
      delete vnp_Params["vnp_SecureHashType"];

      const secretKey = process.env.VNPAY_SECRETKEY;

      const sortedParams = Object.keys(vnp_Params)
        .sort()
        .reduce((result, key) => {
          result[key] = vnp_Params[key];
          return result;
        }, {});

      const signData = querystring.stringify(sortedParams);
      const hmac = crypto.createHmac("sha512", secretKey);
      const signed = hmac
        .update(new Buffer.from(signData, "utf-8"))
        .digest("hex");

      // Kiểm tra tính hợp lệ của chữ ký
      if (secureHash === signed) {
        const orderId = vnp_Params["vnp_TxnRef"];
        const rspCode = vnp_Params["vnp_ResponseCode"];

        if (rspCode === "00") {
          // Thanh toán thành công
          // Cập nhật trạng thái đơn hàng trong CSDL
          return res.status(200).json({
            RspCode: "00",
            Message: "Thanh toán thành công",
          });
        } else {
          // Thanh toán thất bại
          return res.status(200).json({
            RspCode: "01",
            Message: "Thanh toán thất bại",
          });
        }
      } else {
        return res.status(200).json({
          RspCode: "97",
          Message: "Chữ ký không hợp lệ",
        });
      }
    } catch (error) {
      return res.status(500).json({
        RspCode: "99",
        Message: error.message,
      });
    }
  }
}

module.exports = new VNPayController();
