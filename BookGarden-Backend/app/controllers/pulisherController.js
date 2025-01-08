const PulisherModel = require("../models/pulisher");
const ProductModel = require("../models/product");

const pulisherController = {
  getAllPulisher: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    try {
      const pulsihers = await PulisherModel.paginate({}, options);
      res.status(200).json({ data: pulsihers });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getPulisherById: (req, res) => {
    try {
      res.status(200).json({ data: res.pulisher });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createPulisher: async (req, res) => {
    const pulisher = new PulisherModel({
      name: req.body.name,
    });

    try {
      const newPulisher = await pulisher.save();
      res.status(200).json({ data: newPulisher });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deletePulisher: async (req, res) => {
    try {
      const user = await PulisherModel.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(200).json("Pulisher does not exist");
      }
      res.status(200).json("Delete pulisher success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updatePulisher: async (req, res) => {
    const { name, bio, image } = req.body;

    try {
      const updatedPulisher = await PulisherModel.findByIdAndUpdate(
        req.params.id,
        { name, bio, image },
        { new: true }
      );
      if (!updatedPulisher) {
        return res.status(404).json({ message: "Pulisher not found" });
      }
      res.status(200).json({ data: updatedPulisher });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  searchPulisherByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    const name = req.query.name;

    try {
      const Pulishers = await PulisherModel.paginate(
        { name: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: Pulishers });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getProductsByPulisher: async (req, res) => {
    const pulisherId = req.params.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 50000;

    const options = {
      page: page,
      limit: limit,
    };

    console.log(pulisherId);

    try {
      const pulisher = await PulisherModel.findById(pulisherId);
      if (!pulisher) {
        return res.status(404).json({ message: "Pulisher not found" });
      }

      const products = await ProductModel.paginate(
        { pulisher: pulisherId },
        options
      );

      res.status(200).json({ data: products });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = pulisherController;
