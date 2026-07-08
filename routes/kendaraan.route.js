const express = require("express");

// router
const router = express.Router();

const kendaraanController = require("../controller/kendaraan.controller");

const upload = require("../middlewares/upload");

router.get('/count', kendaraanController.count);

router.post("/", upload.single("gambar"), kendaraanController.create);
router.get("/", kendaraanController.getAll);

router.delete("/", upload.none(), kendaraanController.delete);

router.put("/", upload.single("gambar"), kendaraanController.update);

module.exports = router;
