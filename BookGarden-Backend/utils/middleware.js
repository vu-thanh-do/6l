"use strict";

const jwt = require("jsonwebtoken");
const _const = require("../app/config/constant");
const Category = require("../app/models/category");
const Author = require("../app/models/author");
const Pulisher = require("../app/models/pulisher");
const Product = require("../app/models/product");
const Order = require("../app/models/order");
const News = require("../app/models/news");
const User = require("../app/models/user");

module.exports = {
  checkLogin: (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).send("Access Denied");

    try {
      const verified = jwt.verify(token, _const.JWT_ACCESS_KEY);
      next();
    } catch (err) {
      return res.status(400).send("Invalid Token");
    }
  },

  getNews: async (req, res, next) => {
    let news;
    try {
      news = await News.findById(req.params.id);
      if (news == null) {
        return res.status(404).json({ message: "Cannot find news" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }

    res.news = news;
    next();
  },

  getCategory: async (req, res, next) => {
    let category;
    try {
      category = await Category.findById(req.params.id);
      if (category == null) {
        return res.status(404).json({ message: "Cannot find category" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }

    res.category = category;
    next();
  },
  getAuthor: async (req, res, next) => {
    let author;
    try {
      author = await Author.findById(req.params.id);
      if (author == null) {
        return res.status(404).json({ message: "Cannot find author" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }

    res.author = author;
    next();
  },
  getPulisher: async (req, res, next) => {
    let pulisher;
    try {
      pulisher = await Pulisher.findById(req.params.id);
      if (pulisher == null) {
        return res.status(404).json({ message: "Cannot find pulisher" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }

    res.pulisher = pulisher;
    next();
  },
  getProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      console.log("Product ID:", productId);

      // Lấy thông tin sản phẩm
      // Lấy thông tin sản phẩm
      const product = await Product.findById(productId)
        .populate("category") // Lấy thông tin chi tiết từ bảng category
        .populate("author") // Lấy thông tin chi tiết từ bảng author
        .populate("pulisher"); // Lấy thông tin chi tiết từ bảng pulisher

      if (!product) {
        return res.status(404).json({ message: "Cannot find product" });
      }

      res.status(200).json({
        product: product,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  },

  getOrder: async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.id)
        .populate("user", "username") // Lấy thông tin user và chỉ lấy trường username
        .populate({
          path: "products.product",
          select: "name stock image", // Chọn các trường name, stock và image của sản phẩm
        }); // Lấy thông tin products và chỉ lấy trường name của product

      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
      }

      // Truy cập và trả về tên cụ thể của từng ID
      const userName = order.user ? order.user.username : null;
      const products = order.products.map((product) => ({
        name: product.product.name,
        stock: product.stock,
        image: product.product.image,
        salePrice: product.salePrice,
      }));

      const result = {
        _id: order._id,
        user: userName,
        products: products,
        orderTotal: order.orderTotal,
        address: order.address,
        billing: order.billing,
        status: order.status,
        description: order.description,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      };

      res.order = result;
      next();
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  },

  checkRole: (role) => async (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).send("Forbidden");
    }
    next();
  },
};
