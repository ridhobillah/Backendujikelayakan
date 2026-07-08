'use strict';

const bcrypt = require('bcrypt');

module.exports = {

  async up(queryInterface, Sequelize) {

    const hashedPassword =
      await bcrypt.hash('adminrental', 10);

    await queryInterface.bulkInsert('users', [

      {
        nama: 'Admin',
        email: 'admin@gmail.com',
        role: 'admin',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

    ]);

  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete(
      'users',
      {
        email: 'admin@gmail.com'
      },
      {}
    );

  }

};