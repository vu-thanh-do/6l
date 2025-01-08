const express = require("express");
const router = express.Router();
const vnpayController = require("../controllers/vnpayController");

// Route tạo URL thanh toán
router.post("/create-payment-url", vnpayController.createPaymentUrl);

// Route kiểm tra kết quả thanh toán (IPN)
router.get("/vnpay-ipn", vnpayController.vnpayIPN);

module.exports = router;
