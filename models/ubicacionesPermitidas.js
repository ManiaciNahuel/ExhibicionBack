module.exports = (sequelize, DataTypes) => {
    const UbicacionesPermitidas = sequelize.define('UbicacionesPermitidas', {
      idSucursal: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      sucursal: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false
      },
      numeroUbicacion: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      subdivision: {
        type: DataTypes.STRING,
        allowNull: true
      },
      numeroSubdivision: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      idCategoria: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    }, {
      tableName: 'UbicacionesPermitidas',
      timestamps: false
    });
  
    return UbicacionesPermitidas;
  };
  