const vouche = require("../models/vouche");

const voucherContainer = {
  getAllVoucher: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;
    const options = {
      page: page,
      limit: limit,
    };
    const today = new Date();
    const listVoucher = await vouche.find({});
    for (const a of listVoucher) {
      const startDate = new Date(a.startDate);
      const endDate = new Date(a.endDate);
      if (today < startDate) {
        a.status = "inactive"; 
      } else if (today > endDate) {
        a.status = "inactive"; 
      } else {
        a.status = "active"; 
      }
      await a.save();
    }
    try {
      const categories = await vouche.paginate({}, options);
      res.status(200).json({ data: categories });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getVoucherById: async (req, res) => {
    try {
      const categories = await vouche.findById(req.params.id);
      res.status(200).json(categories);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createVoucher: async (req, res) => {
    const category = new vouche({
      name: req.body.name,
      type: req.body.type,
      value: req.body.value,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      require: req.body.require,
    });

    try {
      const newCategory = await category.save();
      res.status(200).json(newCategory);
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteVoucher: async (req, res) => {
    try {
      const user = await vouche.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(200).json(" does not exist");
      }
      res.status(200).json("Delete  success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateVoucher: async (req, res) => {
    const { name, value, type, startDate, endDate, require } = req.body;
    try {
      const updatedCategory = await vouche.findByIdAndUpdate(
        req.params.id,
        { name, value, type, startDate, endDate, require },
        { new: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: " not found" });
      }
      res.status(200).json({ data: updatedCategory });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  },
};

module.exports = voucherContainer;
