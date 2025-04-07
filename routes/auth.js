// routes/auth.js
const express = require('express');
const router = express.Router();
const { Usuario, Sucursal } = require('../models');

router.post('/login', async (req, res) => {
  console.log("Body recibido:", req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  try {
    const usuario = await Usuario.findOne({
      where: { email, password },
      include: Sucursal
    });

    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      sucursalId: usuario.sucursalId,
      sucursal: usuario.Sucursal?.nombre || null
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno en login' });
  }
});

module.exports = router;
