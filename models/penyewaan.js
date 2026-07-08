"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Penyewaan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Penyewaan.belongsTo(models.User, {
        foreignKey: "id_user",
      });

      Penyewaan.belongsTo(models.Kendaraan, {
        foreignKey: "id_kendaraan",
      });

      Penyewaan.hasOne(models.Pembayaran, {
        foreignKey: "id_penyewaan",
      });

    
    }
  }
  Penyewaan.init(
    {
      id_user: DataTypes.INTEGER,
      id_kendaraan: DataTypes.INTEGER,
      tgl_sewa: DataTypes.DATE,
      batas_sewa: DataTypes.DATE,
      tgl_kembali: DataTypes.DATE,
      foto_ktp: DataTypes.STRING,
      kode_booking: DataTypes.STRING,
      status_sewa: DataTypes.STRING,
      total_harga: DataTypes.DECIMAL,
      denda: DataTypes.DECIMAL,
    },
    {
      sequelize,
      modelName: "Penyewaan",
    },
  );
  return Penyewaan;
};
