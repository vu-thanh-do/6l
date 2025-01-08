const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
  { collection: "author" }
);

AuthorSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Author", AuthorSchema);
