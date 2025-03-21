require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());

// Importar rutas
const sucursalesRoutes = require('./routes/sucursales');
const usuariosRoutes = require('./routes/usuarios');
const productosRoutes = require('./routes/productos');
const ubicacionesRoutes = require('./routes/ubicaciones');

app.use('/sucursales', sucursalesRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/uploads', express.static('uploads'));
app.use('/productos', productosRoutes);
app.use('/ubicaciones', ubicacionesRoutes);

// Iniciar el servidor y conectar a la base de datos
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
    console.log('Base de datos sincronizada');
    app.listen(PORT, () => {
        console.log(`Servidor en ejecución en el puerto ${PORT}`);
    });
}).catch(err => {
    console.error('Error al sincronizar la base de datos:', err);
});
