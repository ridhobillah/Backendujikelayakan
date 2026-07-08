const express = require("express");
const router = express.Router();

const controller = require("../controller/pembayaran.controller");

const upload = require("../middlewares/uploadPembayaran");

router.post("/", upload.single("bukti_pembayaran"), controller.create);
router.get("/export-excel",controller.exportExcel);

router.get("/pendapatan", controller.getTotalPendapatan);

router.post("/denda", upload.single("bukti_pembayaran"), controller.bayarDenda);

router.get("/admin", controller.getAllPembayaranAdmin);

router.get("/:id", controller.getById);

module.exports = router;
