// models/productoUbicacion.js
module.exports = (sequelize, DataTypes) => {
  const ProductoUbicacion = sequelize.define('ProductoUbicacion', {
    codebar: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Nuevo campo: codplex
    codplex: {
      type: DataTypes.STRING,
      allowNull: true
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
    },
    numeroSubdivision: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fechaActualizacion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }

  });

  return ProductoUbicacion;
};
