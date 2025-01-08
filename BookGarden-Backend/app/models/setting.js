const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const settingSchema = new mongoose.Schema(
  {
    time: Number,
  },
  { timestamps: true },
  { collection: "setting" }
);
settingSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("setting", settingSchema);
