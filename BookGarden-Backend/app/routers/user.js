const userController = require("../controllers/userController");
const router = require("express").Router();
const verifyToken = require("../../utils/middleware");
const _const = require("../config/constant");
const middleware = require("../../utils/middleware");

router.put("/:id", verifyToken.checkLogin, userController.updateUser);
router.put(
  "/change-role/:id",
  verifyToken.checkLogin,
  userController.changeUserRole
);
router.get(
  "/profile/:id",
  verifyToken.checkLogin,
  userController.getProfileById
);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/search", verifyToken.checkLogin, userController.getAllUser);
router.get("/profile", userController.getProfile);
router.get(
  "/searchByEmail",
  verifyToken.checkLogin,
  userController.searchUserByEmail
);

router.post("/", verifyToken.checkLogin, userController.createUser);
router.delete("/:id", verifyToken.checkLogin, userController.deleteUser);

module.exports = router;
