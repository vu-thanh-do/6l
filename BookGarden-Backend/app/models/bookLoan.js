const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const bookLoanSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    books: [{ 
      id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product", 
        required: true
      },
      name: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      image: {
        type: String,
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      borrowDays: {
        type: Number,
        required: true
      },
      borrowFee: {
        type: Number,
        required: true
      },
      dueDate: {
        type: Date,
        required: true
      }
    }],
    totalBooks: {
      type: Number,
      required: true
    },
    totalBorrowFee: {
      type: Number,
      required: true
    },
    depositFee: {
      type: Number,
      required: true
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "shipping"],
      required: true
    },
    shippingAddress: {
      province: String,
      district: String,
      ward: String,
      address: String,
      note: String
    },
    shippingFee: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    borrowDate: {
      type: Date,
      default: Date.now
    },
    returnDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ["pending", "borrowed", "returned", "overdue", "extended", "cancelled"],
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