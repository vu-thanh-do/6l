const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const PulisherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  { collection: "pulisher" }
);

PulisherSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Pulisher", PulisherSchema);
