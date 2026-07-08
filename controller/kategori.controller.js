const Validator = require("fastest-validator");
const v = new Validator();

const { Kategori } = require("../models");

module.exports = {

  create: async (req, res) => {
    try {
      const { nama_kategori } = req.body;


      const schema = {
        nama_kategori: {
          type: "string",
          min: 3,
        },
      };

      const data = {
        nama_kategori,
      };


      const validate = v.validate(data, schema);

      if (validate.length) {
        return res.status(400).json({
          message: "Validation Error",
          error: validate,
        });
      }

      const cekKategori = await Kategori.findOne({
        where: {
          nama_kategori,
        },
      });

      if (cekKategori) {
        return res.status(400).json({
          message: "Kategori sudah ada",
        });
      }


      const kategori = await Kategori.create({
        nama_kategori,
        stok: 0,
      });
      return res.status(201).json({
        message: "Kategori berhasil ditambahkan",

        data: kategori,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  getAll: async (req, res) => {
    try {
      const kategori = await Kategori.findAll();

      return res.status(200).json({
        message: "Berhasil mengambil data kategori",
        data: kategori,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  
};
