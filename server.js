require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
app.use(express.json());
app.use(cors());

// Rutas
app.use('/sucursales', require('./routes/sucursales'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/uploads', express.static('uploads'));
app.use('/productos', require('./routes/productos'));
app.use('/ubicaciones', require('./routes/ubicaciones'));
app.use('/auth', require('./routes/auth')); // <- RUTA DE LOGIN AQUÍ

// Server
const PORT = process.env.PORT || 3000;
sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
  });
}).catch(err => {
  console.error('Error al sincronizar la base de datos:', err);
});
