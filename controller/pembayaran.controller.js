const ExcelJS = require("exceljs");

const { Pembayaran, Penyewaan, User, Kendaraan } = require("../models");


module.exports = {

  getTotalPendapatan: async (req, res) => {
  try {
    const data = await Pembayaran.findAll({
      where: {
        status_pembayaran: "berhasil",
      },
    });

    const total_pendapatan = data.reduce((acc, item) => {
      return acc + Number(item.total_pembayaran);
    }, 0);

    return res.status(200).json({
      message: "success",
      total_pendapatan,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
},

 
  create: async (req, res) => {
    try {
      const { id_penyewaan, metode } = req.body;
      if (!["transfer", "qris"].includes(metode)) {
        return res.status(400).json({
          message: "Metode harus transfer atau qris",
        });
      }
      const penyewaan = await Penyewaan.findByPk(id_penyewaan);

      if (!penyewaan) {
        return res.status(404).json({
          message: "Data penyewaan tidak ditemukan",
        });
      }
      const pembayaranLama = await Pembayaran.findOne({
        where: {
          id_penyewaan,
        },
      });

      if (pembayaranLama) {
        return res.status(400).json({
          message: "Penyewaan ini sudah dibayar",
        });
      }
      if (!req.file) {
        return res.status(400).json({
          status: 400,
          message: "Berikan bukti transfer",
        });
      }

      const total_pembayaran = penyewaan.total_harga;

      const bukti = req.file.filename;
      const pembayaran = await Pembayaran.create({
        id_penyewaan,
        tgl_pembayaran: new Date(),
        total_pembayaran,
        metode_pembayaran: metode,
        bukti_pembayaran: bukti,
        status_pembayaran: "berhasil",
        jenis_pembayaran: "sewa",
      });

      return res.status(201).json({
        status: 201,

        message: "Pembayaran berhasil",

        data: {
          id_pembayaran: pembayaran.id,

          kode_booking: penyewaan.kode_booking,

          id_penyewaan,

          total_pembayaran,

          metode_pembayaran: metode,

          bukti_pembayaran: bukti,

          status_pembayaran: pembayaran.status_pembayaran,

          tgl_pembayaran: pembayaran.tgl_pembayaran,
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

      const data = await Pembayaran.findByPk(id, {
        include: [
          {
            model: Penyewaan,
          },
        ],
      });

      if (!data) {
        return res.status(404).json({
          message: "Pembayaran tidak ditemukan",
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

  getAllPembayaranAdmin: async (req, res) => {
    try {
      const data = await Pembayaran.findAll({
        include: [
          {
            model: Penyewaan,
            include: [
              {
                model: User,
                attributes: ["id", "nama"],
              },
              {
                model: Kendaraan,
              },
            ],
          },
        ],
        order: [["id", "ASC"]],
      });

      res.status(200).json({
        message: "success",
        data,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  },

  bayarDenda: async (req, res) => {
    try {
      const { id_penyewaan, metode } = req.body;
      if (!["transfer", "qris"].includes(metode)) {
        return res.status(400).json({
          message: "Metode harus transfer atau qris",
        });
      }

      const penyewaan = await Penyewaan.findByPk(id_penyewaan);

      if (!penyewaan) {
        return res.status(404).json({
          message: "Data penyewaan tidak ditemukan",
        });
      }

      if (penyewaan.status_sewa !== "terlambat") {
        return res.status(400).json({
          message: "Penyewaan tidak memiliki denda",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Upload bukti pembayaran",
        });
      }

      const pembayaran = await Pembayaran.create({
        id_penyewaan,

        tgl_pembayaran: new Date(),

        total_pembayaran: penyewaan.denda,

        metode_pembayaran: metode,

        bukti_pembayaran: req.file.filename,

        status_pembayaran: "berhasil",
        jenis_pembayaran: "denda",
      });

      await penyewaan.update({
        status_sewa: "selesai",
        denda: 0,
      });

      return res.status(201).json({
        status: 201,

        message: "Denda berhasil dibayar",

        data: pembayaran,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },



exportExcel: async (req, res) => {
  try {
    const data = await Pembayaran.findAll({
      include: [
        {
          model: Penyewaan,
          include: [
            {
              model: User,
              attributes: ["nama"],
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      "Data Pembayaran"
    );

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Penyewa", key: "penyewa", width: 25 },
      { header: "Tanggal", key: "tanggal", width: 20 },
      { header: "Total", key: "total", width: 20 },
      { header: "Metode", key: "metode", width: 20 },
      { header: "Status", key: "status", width: 20 },
      { header: "Bukti", key: "bukti", width: 30 },
      {
        header: "Jenis Pembayaran",
        key: "jenis",
        width: 20,
      },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        id: item.id,
        penyewa: item.Penyewaan?.User?.nama || "-",
        tanggal: new Date(
          item.createdAt
        ).toLocaleDateString("id-ID"),
        total: item.total_pembayaran,
        metode: item.metode_pembayaran,
        status: item.status_pembayaran,
        bukti: item.bukti_pembayaran || "-",
        jenis: item.jenis_pembayaran,
      });
    });

    worksheet.getRow(1).font = {
      bold: true,
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=data-pembayaran.xlsx"
    );

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}
};
