const express = require('express');
const router = express.Router();
const { Usuario, Sucursal } = require('../models');

// ✅ Crear un usuario
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol, sucursalId } = req.body;
        const usuario = await Usuario.create({ nombre, email, password, rol, sucursalId });
        res.status(201).json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
});

// ✅ Obtener todos los usuarios
router.get('/', async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            include: [{ model: Sucursal, attributes: ['nombre'] }]
        });
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});
// ✅ Login de usuario
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const usuario = await Usuario.findOne({ where: { email, password } });

        if (!usuario) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Error al iniciar sesión' });
    }
});

module.exports = router;
