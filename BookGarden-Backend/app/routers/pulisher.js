const pulisherController = require("../controllers/pulisherController");
const router = require("express").Router();
const middleware = require("../../utils/middleware");

router.post("/search", pulisherController.getAllPulisher);
router.get("/searchByName", pulisherController.searchPulisherByName);
router.post("/products/:id", pulisherController.getProductsByPulisher);
router.post("/", middleware.checkLogin, pulisherController.createPulisher);
router.put("/:id", middleware.checkLogin, pulisherController.updatePulisher);
router.delete("/:id", middleware.checkLogin, pulisherController.deletePulisher);
router.get("/:id", middleware.getPulisher, pulisherController.getPulisherById);

module.exports = router;
