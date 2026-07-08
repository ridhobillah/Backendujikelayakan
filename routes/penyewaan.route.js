const express = require("express");
const router = express.Router();

const controller = require("../controller/penyewaan.controller");

const upload = require("../middlewares/uploadKtp");

router.post("/", upload.single("ktp"), controller.create);
router.post("/retur", controller.retur);

router.get("/export/pdf/:id", controller.exportPdf);
router.get("/export-excel", controller.exportExcel);
router.get("/admin", controller.getAllAdmin);
router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.get("/growth/penyewaan", controller.getGrowthPenyewaan);
module.exports = router;