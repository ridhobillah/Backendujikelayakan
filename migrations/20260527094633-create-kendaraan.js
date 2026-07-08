'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Kendaraans', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      id_kategori: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Kategoris',
          key: 'id'
        }
      },

      nama_kendaraan: {
        type: Sequelize.STRING
      },

      merk: {
        type: Sequelize.STRING
      },

      tahun: {
        type: Sequelize.INTEGER
      },

      cc: {
        type: Sequelize.INTEGER
      },

      plat_nomor: {
        type: Sequelize.STRING
      },

      harga: {
        type: Sequelize.DECIMAL
      },

      status_ketersediaan: {
        type: Sequelize.ENUM('tersedia', 'disewa'),
        defaultValue: 'tersedia'
      },

      gambar: {
        type: Sequelize.STRING
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }

    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Kendaraans');
  }
};