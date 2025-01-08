const vouche = require("../models/vouche");

const voucherContainer = {
  getAllVoucher: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

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
    const { name ,value ,type } = req.body;
    try {
      const updatedCategory = await vouche.findByIdAndUpdate(
        req.params.id,
        { name ,value ,type},
        { new: true }
      );
      if (!updatedCategory) {
        return res.status(404).json({ message: " not found" });
      }
      res.status(200).json({ data: updatedCategory });
    } catch (err) {
      res.status(500).json(err);
    }
  },
};

module.exports = voucherContainer;
