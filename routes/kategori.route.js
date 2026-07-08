const express = require('express')

const router = express.Router()

const kategoriController = require('../controller/kategori.controller')



router.post(
    "/",
    kategoriController.create
)
router.get("/", kategoriController.getAll);

module.exports = router