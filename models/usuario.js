const { DataTypes } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const Usuario = sequelize.define('Usuario', {
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false
      },
      rol: {
        type: DataTypes.STRING,
        allowNull: false
      }
    });
  
    return Usuario;
  };
  