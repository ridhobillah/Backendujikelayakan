"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Kategori extends Model {

    static associate(models) {
      Kategori.hasMany(models.Kendaraan, {
        foreignKey: "id_kategori",
        sourceKey: "id"
      });
    }
  }

  Kategori.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },

      nama_kategori: DataTypes.STRING,
      stok: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "Kategori",
      tableName: "kategoris"
    }
  );

  return Kategori;
};