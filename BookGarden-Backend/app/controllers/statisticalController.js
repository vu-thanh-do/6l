const StatisticalModel = require("../models/statistical");
const UserModel = require("../models/user");
const ProductModel = require("../models/product");
const CategoryModel = require("../models/category");
const OrderModel = require("../models/order");
const AuthorModel = require("../models/author");
const PulisherModel = require("../models/pulisher");
const ComplaintModel = require("../models/complaintModel");

const statisticalController = {
  getAllStatistical: async (req, res) => {
    try {
      // Đếm số lượng user và sản phẩm trong cơ sở dữ liệu MongoDB
      const userCountPromise = UserModel.countDocuments();
      const productCountPromise = ProductModel.countDocuments();
      const categoryCountPromise = CategoryModel.countDocuments();
      const authorCountPromise = AuthorModel.countDocuments();
      const pulisherCountPromise = PulisherModel.countDocuments();
      const currentDate = new Date();
      const last12Months = new Date(
        currentDate.setMonth(currentDate.getMonth() - 11)
      );

      // Thống kê đơn hàng
      const orderCountPromise = OrderModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: last12Months,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
      ]);

      const orderIncomePromise = OrderModel.aggregate([
        {
          $match: {
            status: "final", // Hoặc status: "delivered" tùy vào trạng thái đã thanh toán hay giao hàng thành công của đơn hàng
            createdAt: {
              $gte: last12Months,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$orderTotal" },
          },
        },
      ]);

      // Thống kê khiếu nại
      const complaintCountPromise = ComplaintModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: last12Months,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: { $month: "$createdAt" },
            total: { $sum: 1 },
          },
        },
      ]);

      const complaintIncomePromise = ComplaintModel.aggregate([
        {
          $match: {
            createdAt: {
              $gte: last12Months,
              $lte: new Date(),
            },
          },
        },
        {
          $group: {
            _id: null,
            totalIncome: { $sum: "$compensationAmount" }, // Giả sử có trường `compensationAmount` chứa số tiền bồi thường cho khiếu nại
          },
        },
      ]);

      // Sử dụng Promise.all để chờ tất cả các Promise hoàn thành
      Promise.all([
        userCountPromise,
        productCountPromise,
        categoryCountPromise,
        authorCountPromise,
        pulisherCountPromise,
        orderCountPromise,
        orderIncomePromise,
        complaintCountPromise,
        complaintIncomePromise,
      ])
        .then((results) => {
          const [
            userCount,
            productCount,
            categoryCount,
            authorCount,
            pulisherCount,
            orderCount,
            orderIncome,
            complaintCount,
            complaintIncome,
          ] = results;

          const data = [
            { name: "Tháng 1", Total: 0 },
            { name: "Tháng 2", Total: 0 },
            { name: "Tháng 3", Total: 0 },
            { name: "Tháng 4", Total: 0 },
            { name: "Tháng 5", Total: 0 },
            { name: "Tháng 6", Total: 0 },
            { name: "Tháng 7", Total: 0 },
            { name: "Tháng 8", Total: 0 },
            { name: "Tháng 9", Total: 0 },
            { name: "Tháng 10", Total: 0 },
            { name: "Tháng 11", Total: 0 },
            { name: "Tháng 12", Total: 0 },
          ];

          // Cập nhật số lượng đơn hàng theo tháng
          orderCount.forEach((item) => {
            const month = item._id;
            const total = item.total;
            data[month - 1].Total = total;
          });

          // Kết quả trả về
          const result = {
            userTotal: userCount,
            productTotal: productCount,
            categoryTotal: categoryCount,
            authorTotal: authorCount,
            pulisherTotal: pulisherCount,
            orderTotal: orderCount.reduce((acc, item) => acc + item.total, 0),
            complaintTotal: complaintCount.reduce(
              (acc, item) => acc + item.total,
              0
            ),
            totalIncome:
              orderIncome.length > 0 ? orderIncome[0]?.totalIncome : 0, // Tổng thu nhập từ đơn hàng đã hoàn thành
            complaintIncome:
              complaintIncome.length > 0 ? complaintIncome[0]?.totalIncome : 0, // Tổng thu nhập từ khiếu nại
            data,
          };

          res.status(200).json({ data: result });
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = statisticalController;
