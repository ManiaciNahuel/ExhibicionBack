const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 60000
    },
    logging: false
});

// ✅ Importar modelos
const Sucursal = require('./sucursal')(sequelize, DataTypes);
const Usuario = require('./usuario')(sequelize, DataTypes);
const Ubicacion = require('./ubicacion')(sequelize, DataTypes);
const ProductoUbicacion = require('./productoUbicacion')(sequelize, DataTypes);

// ⚠️ Si usás el modelo de Producto desde la otra base, NO lo declares acá.
// Si llegás a usar un modelo de Producto interno (no recomendado en tu caso), deberías definirlo igual.

// ✅ Relación: Sucursal tiene muchos Usuarios
Sucursal.hasMany(Usuario, { foreignKey: 'sucursalId' });
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursalId' });

// 👇 No hacemos relaciones con Producto si usás la base externa
// Pero si tenés una tabla de ubicaciones internas como referencia, podrías hacer:
Ubicacion.hasMany(ProductoUbicacion, { foreignKey: 'ubicacionId' }); // opcional
ProductoUbicacion.belongsTo(Ubicacion, { foreignKey: 'ubicacionId' }); // opcional

// ✅ Exportar todos los modelos
module.exports = {
    sequelize,
    Sucursal,
    Usuario,
    Ubicacion,
    ProductoUbicacion
};
