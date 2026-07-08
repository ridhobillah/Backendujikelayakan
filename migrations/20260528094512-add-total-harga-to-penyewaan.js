"use strict";

module.exports = {

  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn(
      "Penyewaans", // nama table database
      "total_harga", // nama kolom baru
      {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      }
    );

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.removeColumn(
      "Penyewaans",
      "total_harga"
    );

  }

};