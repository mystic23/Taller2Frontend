const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false
});

// Probar conexión
sequelize.authenticate()
  .then(() => console.log('Connected to SQLite database'))
  .catch(err => console.error('Database connection error:', err));

module.exports = sequelize;