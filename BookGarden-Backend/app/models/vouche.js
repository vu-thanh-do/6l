const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const voucherSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    value : Number
  },
  { timestamps: true },
  { collection: "Voucher" }
);
voucherSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Voucher", voucherSchema);
