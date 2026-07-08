const { Op } = require("sequelize");
const { Kategori, Kendaraan, Penyewaan } = require("../models");

module.exports = {
  count: async (req, res) => {
    try {
      const total = await Kendaraan.count();

      return res.status(200).json({
        message: "Total kendaraan",
        total: total,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },
  

  create: async (req, res) => {
    try {
      const {
        nama_kategori,
        nama_kendaraan,
        merk,
        tahun,
        cc,
        plat_nomor,
        harga,
        status_ketersediaan,
      } = req.body;

      const kategori = await Kategori.findOne({
        where: { nama_kategori },
      });

      if (!kategori) {
        return res.status(404).json({
          message: "Kategori tidak ditemukan",
        });
      }

      const gambar = req.file ? req.file.filename : null;

      const kendaraan = await Kendaraan.create({
        nama_kendaraan,
        merk,
        tahun,
        cc,
        plat_nomor,
        harga,
        status_ketersediaan: status_ketersediaan || "tersedia",
        id_kategori: kategori.id,
        gambar,
      });

      await kategori.update({
        stok: kategori.stok + 1,
      });

      return res.status(201).json({
        status: 201,
        message: "Kendaraan berhasil ditambahkan",
        data: kendaraan,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          message: "Plat nomor sudah digunakan",
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const kendaraan = await Kendaraan.findAll({
        include: [
          {
            model: Kategori,
            attributes: ["id", "nama_kategori", "stok"],
          },
        ],
      });

      return res.status(200).json({
        status: 200,
        message: "Data kendaraan berhasil diambil",
        data: kendaraan,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id_kendaraan } = req.body;

      const kendaraan = await Kendaraan.findByPk(id_kendaraan, {
        include: Kategori,
      });

      if (!kendaraan) {
        return res.status(404).json({
          message: "Kendaraan tidak ditemukan",
        });
      }

      if (kendaraan.status_ketersediaan === "disewa") {
        return res.status(400).json({
          message: "Kendaraan sedang disewa",
        });
      }

      await kendaraan.Kategori.update({
        stok: kendaraan.Kategori.stok - 1,
      });

      await kendaraan.destroy();

      return res.status(200).json({
        status: 200,
        message: "Kendaraan berhasil dihapus",
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  update: async (req, res) => {
    try {
      const {
        id_kendaraan,
        nama_kendaraan,
        merk,
        tahun,
        cc,
        plat_nomor,
        harga,
        status_ketersediaan,
      } = req.body;

      const kendaraan = await Kendaraan.findByPk(id_kendaraan);

      if (!kendaraan) {
        return res.status(404).json({
          message: "Kendaraan tidak ditemukan",
        });
      }

      const gambar = req.file ? req.file.filename : kendaraan.gambar;

      await kendaraan.update({
        nama_kendaraan: nama_kendaraan || kendaraan.nama_kendaraan,

        merk: merk || kendaraan.merk,

        tahun: tahun || kendaraan.tahun,

        cc: cc || kendaraan.cc,

        plat_nomor: plat_nomor || kendaraan.plat_nomor,

        harga: harga || kendaraan.harga,

        status_ketersediaan:
          status_ketersediaan || kendaraan.status_ketersediaan,

        gambar,
      });

      return res.status(200).json({
        status: 200,
        message: "Kendaraan berhasil diupdate",
        data: kendaraan,
      });
    } catch (error) {
      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(400).json({
          message: "Plat nomor sudah digunakan",
        });
      }

      return res.status(500).json({
        message: error.message,
      });
    }
  },
};
