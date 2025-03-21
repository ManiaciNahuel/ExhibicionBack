const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Sucursal', {
        nombre: { type: DataTypes.STRING, allowNull: false },
        direccion: { type: DataTypes.STRING, allowNull: false }
    }, {
        timestamps: true
    });
};
