const { DataTypes } = require('sequelize');

// models/sucursal.js

module.exports = (sequelize) => {
    const Sucursal = sequelize.define('Sucursal', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false, // importante para insert manual
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      direccion: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      zona: {
        type: DataTypes.STRING,
        allowNull: false,
      }
    });
  
    return Sucursal;
  };
  