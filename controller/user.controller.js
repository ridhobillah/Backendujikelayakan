const { User } = require("../models");
const bcrypt = require("bcrypt");

module.exports = {

  count: async (req, res) => {
    try {
      const total = await User.count();

      return res.status(200).json({
        message: "Total User",
        total: total,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message,
      });
    }
  },

  register: async (req, res) => {
    try {
      const nama = (req.body?.nama || "").trim();
      const email = (req.body?.email || "").trim();
      const password = (req.body?.password || "").trim();
      const alamat = req.body?.alamat;
      const no_telp = req.body?.no_telp;
      const role = req.body?.role || "user";
      if (!nama || !email || !password) {
        return res.status(400).json({
          status: 400,
          message: "Nama, email, password wajib diisi"
        });
      }

      const existing = await User.findOne({
        where: { email }
      });

      if (existing) {
        return res.status(400).json({
          status: 400,
          message: "Email sudah terdaftar"
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        nama,
        email,
        password: hashedPassword,
        alamat,
        no_telp,
        role
      });

      return res.status(201).json({
        status: 201,
        message: "User berhasil dibuat",
        data: {
          id_user: user.id_user,
          nama: user.nama,
          email: user.email,
          password: user.password,
          role: user.role
        }
      });

    } catch (error) {
      return res.status(500).json({
        message: error.message
      });
    }
  },

  getAllAdmin: async (req, res) => {

    try {

      const users = await User.findAll({
        attributes: {
          exclude: ["password"]
        }
      });

      return res.status(200).json({
        message: "Berhasil mengambil data user",
        data: users
      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

};