// models/productoUbicacion.js
module.exports = (sequelize, DataTypes) => {
    const ProductoUbicacion = sequelize.define('ProductoUbicacion', {
      codebar: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      numero: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      subdivision: {
        type: DataTypes.STRING
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      ubicacion: {
        type: DataTypes.STRING,
        allowNull: false
      },
      sucursalId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      fechaRegistro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    });
  
    return ProductoUbicacion;
  };
  