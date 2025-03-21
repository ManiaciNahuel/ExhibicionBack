const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    dialectOptions: {
        connectTimeout: 60000
    },
    logging: false
});

// Importar modelos
const Sucursal = require('./sucursal')(sequelize);
const Usuario = require('./usuario')(sequelize);
const Producto = require('./producto')(sequelize);
const Ubicacion = require('./ubicacion')(sequelize);

// Relación: Un producto puede estar en varias ubicaciones
Producto.hasMany(Ubicacion, { foreignKey: 'productoId' });
Ubicacion.belongsTo(Producto, { foreignKey: 'productoId' });
Sucursal.hasMany(Usuario, { foreignKey: 'sucursalId' });
Usuario.belongsTo(Sucursal, { foreignKey: 'sucursalId' });

module.exports = { sequelize, Sucursal, Usuario, Producto, Ubicacion };
