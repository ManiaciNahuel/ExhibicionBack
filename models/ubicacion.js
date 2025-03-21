const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    return sequelize.define('Ubicacion', {
        productoId: { type: DataTypes.INTEGER, allowNull: false },

        tipoUbicacion: { // Ej: G, M, CC, B
            type: DataTypes.STRING,
            allowNull: false
        },
        numeroUbicacion: { // Ej: 1, 2, etc.
            type: DataTypes.INTEGER,
            allowNull: false
        },
        subdivision: { // Ej: E3, P1, PE2 o null
            type: DataTypes.STRING,
            allowNull: true
        },

        cantidad: { type: DataTypes.INTEGER, defaultValue: 1 },

        // Campo compuesto para búsquedas rápidas (ej: G1E3, M2P1)
        codigoUbicacion: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        timestamps: true
    });
};
