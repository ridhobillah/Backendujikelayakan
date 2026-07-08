const { User } = require("../models");

const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

module.exports = {

  login: async (req, res) => {

    try {

      const email =
        (req.body?.email || "").trim();

      const password =
        (req.body?.password || "").trim();

      if (!email || !password) {

        return res.status(400).json({
          status: 400,
          message:
            "Email dan password wajib diisi"
        });

      }

      const user =
        await User.findOne({
          where: { email }
        });

      if (!user) {

        return res.status(404).json({
          status: 404,
          message:
            "User tidak ditemukan"
        });

      }

      const isMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!isMatch) {

        return res.status(400).json({
          status: 400,
          message: "Password salah" 
        });

      }

      const token = jwt.sign(

        {
          id_user: user.id,

          nama: user.nama,

          role: user.role
        },

        process.env.AUTH_SECRET,

        {
          expiresIn: "1d"
        }

      );

      return res.status(200).json({

        status: 200,

        message: "Login berhasil",

        data: {

          user: {

            id_user: user.id_user,

            nama: user.nama,

            email: user.email,

            role: user.role

          },

          token

        }

      });

    } catch (error) {

      return res.status(500).json({
        message: error.message
      });

    }

  }

};