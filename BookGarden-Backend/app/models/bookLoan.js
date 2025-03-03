const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const bookLoanSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    book: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: true 
    },
    borrowDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: true
    },
    returnDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["pending", "borrowed", "returned", "overdue", "extended"],
      default: "pending"
    },
    extensionCount: {
      type: Number,
      default: 0
    },
    note: {
      type: String
    }
  },
  { timestamps: true }
);

bookLoanSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("BookLoan", bookLoanSchema); 