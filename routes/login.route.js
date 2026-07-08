const express = require("express");
const router = express.Router();

const multer = require("multer");
const upload = multer();

const userController = require("../controller/user.controller");
const loginController = require("../controller/login.controller");

// =====================
// REGISTER USER
// =====================
router.post(
  "/register",
  upload.none(),
  userController.register
);

// =====================
// LOGIN USER
// =====================
router.post(
  "/login",
  upload.none(),
  loginController.login
);

module.exports = router;