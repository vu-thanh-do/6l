const AuthorModel = require("../models/author");
const ProductModel = require("../models/product");

const authorController = {
  getAllAuthor: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    try {
      const authors = await AuthorModel.paginate({}, options);
      res.status(200).json({ data: authors });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  getAuthorById: (req, res) => {
    try {
      res.status(200).json({ data: res.author });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  createAuthor: async (req, res) => {
    const author = new AuthorModel({
      name: req.body.name,
      bio: req.body.bio,
      image: req.body.image,
    });

    try {
      const newAuthor = await author.save();
      res.status(200).json({ data: newAuthor });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  deleteAuthor: async (req, res) => {
    try {
      const user = await AuthorModel.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(200).json("Author does not exist");
      }
      res.status(200).json("Delete author success");
    } catch (err) {
      res.status(500).json(err);
    }
  },

  updateAuthor: async (req, res) => {
    const { name, bio, image } = req.body;

    try {
      const updatedAuthor = await AuthorModel.findByIdAndUpdate(
        req.params.id,
        { name, bio, image },
        { new: true }
      );
      if (!updatedAuthor) {
        return res.status(404).json({ message: "Author not found" });
      }
      res.status(200).json({ data: updatedAuthor });
    } catch (err) {
      res.status(500).json(err);
    }
  },

  searchAuthorByName: async (req, res) => {
    const page = req.body.page || 1;
    const limit = req.body.limit || 10;

    const options = {
      page: page,
      limit: limit,
    };

    const name = req.query.name;

    try {
      const authors = await AuthorModel.paginate(
        { name: { $regex: `.*${name}.*`, $options: "i" } },
        options
      );

      res.status(200).json({ data: authors });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getProductsByAuthor: async (req, res) => {
    const authorId = req.params.id;
    const page = req.query.page || 1;
    const limit = req.query.limit || 50000;

    const options = {
      page: page,
      limit: limit,
    };

    console.log(authorId);

    try {
      const author = await AuthorModel.findById(authorId);
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }

      const products = await ProductModel.paginate(
        { author: authorId },
        options
      );

      res.status(200).json({ data: products });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = authorController;
