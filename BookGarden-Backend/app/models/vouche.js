const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const voucherSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    value: Number,
    startDate: Date,
    endDate: Date,
    require: String,
    status: {
      default: "active",
      type: String,
    },
  },
  { timestamps: true },
  { collection: "Voucher" }
);
voucherSchema.plugin(mongoosePaginate);
module.exports = mongoose.model("Voucher", voucherSchema);
