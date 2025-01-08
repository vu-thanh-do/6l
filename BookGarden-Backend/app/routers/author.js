const authorController = require("../controllers/authorController");
const router = require("express").Router();
const middleware = require("../../utils/middleware");

router.post("/search", authorController.getAllAuthor);
router.get("/searchByName", authorController.searchAuthorByName);
router.post("/products/:id", authorController.getProductsByAuthor);
router.post("/", middleware.checkLogin, authorController.createAuthor);
router.put("/:id", middleware.checkLogin, authorController.updateAuthor);
router.delete("/:id", middleware.checkLogin, authorController.deleteAuthor);
router.get("/:id", middleware.getAuthor, authorController.getAuthorById);

module.exports = router;
