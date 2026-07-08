"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {

  class Pembayaran extends Model {

    static associate(models) {

      Pembayaran.belongsTo(models.Penyewaan, {
        foreignKey: "id_penyewaan",
      });

    }
  }

  Pembayaran.init({
    
    id_penyewaan: DataTypes.INTEGER,

    tgl_pembayaran: DataTypes.DATE,

    total_pembayaran: DataTypes.DECIMAL,

    metode_pembayaran: DataTypes.ENUM(
      "transfer",
      "qris"
    ),

    bukti_pembayaran: DataTypes.STRING,

    status_pembayaran: DataTypes.STRING,

      jenis_pembayaran: DataTypes.ENUM(
    "sewa",
    "denda"
  ),

  }, {
    sequelize,
    modelName: "Pembayaran",
  });

  return Pembayaran;
};