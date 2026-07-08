const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const { Op } = require("sequelize");

const {
  Penyewaan,
  Kendaraan,
  Kategori,
  Pembayaran,
  User,
} = require("../models");

module.exports = {
  create: async (req, res) => {
    try {
      const id_user = req.user?.id_user;

      if (req.user.role === "admin") {
        return res
          .status(403)
          .json({ message: "Admin tidak boleh melakukan penyewaan" });
      }

      const { id_kendaraan, lama_sewa } = req.body;

      if (!id_user) {
        return res.status(400).json({
          message: "id_user tidak ditemukan di token",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "KTP wajib diupload",
        });
      }

      const kendaraan = await Kendaraan.findByPk(id_kendaraan, {
        include: [{ model: Kategori }],
      });

      if (!kendaraan) {
        return res.status(404).json({
          message: "Kendaraan tidak ditemukan",
        });
      }

      if (kendaraan.status_ketersediaan !== "tersedia") {
        return res.status(400).json({
          message: "Kendaraan sedang disewa",
        });
      }

      if (!kendaraan.Kategori) {
        return res.status(400).json({
          message: "Kategori tidak ditemukan",
        });
      }

      if (kendaraan.Kategori.stok <= 0) {
        return res.status(400).json({
          message: "Stok kendaraan habis",
        });
      }

      const lama = parseInt(lama_sewa || 1);

      const total_harga = kendaraan.harga * lama;

      const kode_booking =
        "BK-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

      const tgl_sewa = new Date();

      const batas_sewa = new Date();

      batas_sewa.setDate(batas_sewa.getDate() + lama);

      const penyewaan = await Penyewaan.create({
        id_user,
        id_kendaraan,
        tgl_sewa,
        batas_sewa,
        total_harga,
        kode_booking,
        foto_ktp: req.file.filename,
        status_sewa: "disewa",
        denda: 0,
      });

      await kendaraan.update({
        status_ketersediaan: "disewa",
      });

      await kendaraan.Kategori.decrement("stok", {
        by: 1,
      });

      return res.status(201).json({
        status: 201,
        message: "Penyewaan berhasil",
        data: penyewaan,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  retur: async (req, res) => {
    try {
      const { id_penyewaan } = req.body;

      const penyewaan = await Penyewaan.findByPk(id_penyewaan, {
        include: {
          model: Kendaraan,
          include: Kategori,
        },
      });

      if (!penyewaan) {
        return res.status(404).json({
          message: "Penyewaan tidak ditemukan",
        });
      }

      if (
        penyewaan.status_sewa === "selesai" ||
        penyewaan.status_sewa === "terlambat"
      ) {
        return res.status(400).json({
          message: "Kendaraan sudah diretur",
        });
      }

      const today = new Date();

      const batas = new Date(penyewaan.batas_sewa);

      let denda = 0;

      const dendaPerHari = 50000;

      // hitung berdasarkan tanggal saja
      today.setHours(0, 0, 0, 0);
      batas.setHours(0, 0, 0, 0);

      if (today > batas) {
        const telatHari = Math.floor((today - batas) / (1000 * 60 * 60 * 24));

        denda = telatHari * dendaPerHari;
      }

      if (denda > 0) {
        await penyewaan.update({
          tgl_kembali: today,
          denda,
          status_sewa: "terlambat",
        });
      } else {
        await penyewaan.update({
          tgl_kembali: today,
          denda: 0,
          status_sewa: "selesai",
        });
      }

      await penyewaan.Kendaraan.update({
        status_ketersediaan: "tersedia",
      });

      await penyewaan.Kendaraan.Kategori.increment("stok", {
        by: 1,
      });

      return res.status(200).json({
        status: 200,

        message:
          denda > 0 ? "Terdapat denda yang harus dibayar" : "Retur berhasil",

        data: {
          kode_booking: penyewaan.kode_booking,

          denda,

          status_sewa: denda > 0 ? "terlambat" : "selesai",
        },
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const data = await Penyewaan.findByPk(id, {
        include: [
          {
            model: Kendaraan,
            include: Kategori,
          },
        ],
      });

      if (!data) {
        return res.status(404).json({
          message: "Penyewaan tidak ditemukan",
        });
      }

      return res.status(200).json({
        status: 200,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const id_user = req.user.id_user;

      const data = await Penyewaan.findAll({
        where: { id_user },
        include: [
          {
            model: Kendaraan,
          },
          {
            model: Pembayaran,
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      return res.status(200).json({
        status: 200,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  getAllAdmin: async (req, res) => {
    try {
      const data = await Penyewaan.findAll({
        include: [{ model: User }, { model: Kendaraan }],
        order: [["createdAt", "ASC"]],
      });

      return res.json({
        status: 200,
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  exportPdf: async (req, res) => {
    try {
      const { id } = req.params;

      const penyewaan = await Penyewaan.findByPk(id, {
        include: [
          {
            model: Kendaraan,
          },
          {
            model: User,
          },
        ],
      });

      if (!penyewaan) {
        return res.status(404).json({
          message: "Data penyewaan tidak ditemukan",
        });
      }

      const doc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${penyewaan.kode_booking}.pdf`,
      );

      doc.pipe(res);

      doc.fontSize(20).text("BUKTI PENYEWAAN", {
        align: "center",
      });

      doc.moveDown(2);

      doc.fontSize(12);

      doc.text(`Kode Booking : ${penyewaan.kode_booking}`);

      doc.text(`Nama Penyewa : ${penyewaan.User.nama}`);

      doc.text(`Kendaraan : ${penyewaan.Kendaraan.nama_kendaraan}`);
      doc.text(`Plat Nomor : ${penyewaan.Kendaraan.plat_nomor}`);

      doc.text(
        `Tanggal Sewa : ${new Date(penyewaan.tgl_sewa).toLocaleDateString(
          "id-ID",
        )}`,
      );

      doc.text(
        `Batas Sewa : ${new Date(penyewaan.batas_sewa).toLocaleDateString(
          "id-ID",
        )}`,
      );

      doc.text(`Status : ${penyewaan.status_sewa}`);

      doc.text(
        `Total Harga : Rp ${Number(penyewaan.denda).toLocaleString("id-ID")}`,
      );

      doc.text(
        `Total Harga : Rp ${Number(penyewaan.total_harga).toLocaleString(
          "id-ID",
        )}`,
      );

      doc.moveDown();

      doc.text("Dokumen ini dibuat otomatis oleh sistem rental kendaraan.", {
        align: "center",
      });

      doc.end();
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

 getGrowthPenyewaan: async (req, res) => {
    try {
      const now = new Date();

      const startThisMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
      );

      const startNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1
      );

      const startLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1
      );

      const thisMonth = await Penyewaan.count({
        where: {
          tgl_sewa: {
            [Op.gte]: startThisMonth,
            [Op.lt]: startNextMonth,
          },
        },
      });

      const lastMonth = await Penyewaan.count({
        where: {
          tgl_sewa: {
            [Op.gte]: startLastMonth,
            [Op.lt]: startThisMonth,
          },
        },
      });

      const growth = thisMonth - lastMonth;

      let percent = 0;

      if (lastMonth > 0) {
        percent = (growth / lastMonth) * 100;
      } else if (thisMonth > 0) {
        percent = 100;
      }

      console.log({
        now,
        startLastMonth,
        startThisMonth,
        startNextMonth,
        thisMonth,
        lastMonth,
        growth,
        percent,
      });

      return res.status(200).json({
        thisMonth,
        lastMonth,
        growth,
        percent: Number(percent.toFixed(2)),
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  exportExcel: async (req, res) => {
    try {
      const data = await Penyewaan.findAll({
        include: [
          {
            model: User,
            attributes: ["nama"],
          },
          {
            model: Kendaraan,
            attributes: ["nama_kendaraan"],
          },
        ],
        order: [["id", "ASC"]],
      });

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Penyewaan");

      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Penyewa", key: "penyewa", width: 25 },
        { header: "Kendaraan", key: "kendaraan", width: 25 },
        { header: "Tgl Sewa", key: "tgl_sewa", width: 20 },
        { header: "Batas", key: "batas_sewa", width: 20 },
        { header: "Kembali", key: "tgl_kembali", width: 20 },
        { header: "Kode Booking", key: "kode_booking", width: 35 },
        { header: "Status", key: "status_sewa", width: 15 },
        { header: "Total", key: "total_harga", width: 20 },
        { header: "Bukti KTP", key: "foto_ktp", width: 30 },
        { header: "Denda", key: "denda", width: 20 },
      ];

      data.forEach((item) => {
        worksheet.addRow({
          id: item.id,
          penyewa: item.User?.nama || "-",
          kendaraan: item.Kendaraan?.nama_kendaraan || "-",
          tgl_sewa: item.tgl_sewa
            ? new Date(item.tgl_sewa).toLocaleDateString("id-ID")
            : "-",
          batas_sewa: item.batas_sewa
            ? new Date(item.batas_sewa).toLocaleDateString("id-ID")
            : "-",
          tgl_kembali: item.tgl_kembali
            ? new Date(item.tgl_kembali).toLocaleDateString("id-ID")
            : "-",
          kode_booking: item.kode_booking,
          status_sewa: item.status_sewa,
          total_harga: item.total_harga,
          foto_ktp: item.foto_ktp || "-",
          denda: item.denda,
        });
      });

      worksheet.getRow(1).font = {
        bold: true,
      };

      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=data-penyewaan.xlsx",
      );

      await workbook.xlsx.write(res);

      res.end();
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },
};
