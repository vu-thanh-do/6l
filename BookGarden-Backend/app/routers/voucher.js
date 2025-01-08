const authorController = require("../controllers/authorController");
const router = require("express").Router();
const middleware = require("../../utils/middleware");
const voucherContainer = require("../controllers/voucherController");

router.get("/voucher", voucherContainer.getAllVoucher);
router.post("/voucher/create", voucherContainer.createVoucher);
router.delete("/voucher/delete/:id", voucherContainer.deleteVoucher);
router.put("/voucher/edit/:id", voucherContainer.updateVoucher);
router.get("/voucher/:id",voucherContainer.getVoucherById);

module.exports = router;
