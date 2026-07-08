"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Kendaraan extends Model {
    static associate(models) {
      Kendaraan.belongsTo(models.Kategori, {
        foreignKey: "id_kategori",
        targetKey: "id",
      });
      Kendaraan.hasMany(models.Penyewaan, {
        foreignKey: "id_kendaraan",
      });
    }
  }

  Kendaraan.init(
    {
      id_kategori: {
        type: DataTypes.INTEGER,
      },

      nama_kendaraan: {
        type: DataTypes.STRING,
      },

      merk: {
        type: DataTypes.STRING,
      },

      tahun: {
        type: DataTypes.INTEGER,
      },

      cc: {
        type: DataTypes.INTEGER,
      },

      plat_nomor: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      harga: {
        type: DataTypes.DECIMAL,
      },

      status_ketersediaan: {
        type: DataTypes.STRING,
      },

      gambar: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Kendaraan",
    },
  );

  return Kendaraan;
};
