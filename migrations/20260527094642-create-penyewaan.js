'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Penyewaans', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users',
          key: 'id'
        }
      },

      id_kendaraan: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Kendaraans',
          key: 'id'
        }
      },

      tgl_sewa: {
        type: Sequelize.DATE
      },

      batas_sewa: {
        type: Sequelize.DATE
      },

      tgl_kembali: {
        type: Sequelize.DATE,
        allowNull: true
      },

      foto_ktp: {
        type: Sequelize.STRING
      },

      kode_booking: {
        type: Sequelize.STRING
      },

      status_sewa: {
        type: Sequelize.ENUM(
          'pending',
          'disewa',
          'terlambat',
          'selesai'
        ),
        defaultValue: 'pending'
      },

      denda: {
        type: Sequelize.DECIMAL,
        defaultValue: 0
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
    await queryInterface.dropTable('Penyewaans');
  }
};