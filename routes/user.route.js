const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const userController = require("../controller/user.controller");
const loginController = require("../controller/login.controller");


router.post("/register", upload.none(), userController.register);
router.get("/count", userController.count);

router.post("/login", upload.none(), loginController.login);
router.get("/", userController.getAllAdmin);

module.exports = router;