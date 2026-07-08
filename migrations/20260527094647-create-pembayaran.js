'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Pembayarans', {

      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      id_penyewaan: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Penyewaans',
          key: 'id'
        }
      },

      tgl_pembayaran: {
        type: Sequelize.DATE
      },

      total_pembayaran: {
        type: Sequelize.DECIMAL
      },

      metode_pembayaran: {
        type: Sequelize.ENUM('transfer', 'qris')
      },

      bukti_pembayaran: {
        type: Sequelize.STRING
      },

      status_pembayaran: {
        type: Sequelize.ENUM(
          'pending',
          'berhasil'
        ),
        defaultValue: 'pending'
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
    await queryInterface.dropTable('Pembayarans');
  }
};