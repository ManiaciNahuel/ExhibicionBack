const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Producto', {
        nombre: { type: DataTypes.STRING, allowNull: false },
        codigoBarras: { type: DataTypes.STRING, allowNull: false, unique: true },
        marca: { type: DataTypes.STRING, allowNull: false },
        categoria: { type: DataTypes.STRING, allowNull: false }
    }, {
        timestamps: true
    });
};
