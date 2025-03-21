const express = require('express');
const router = express.Router();
const { Sucursal } = require('../models');

// ✅ Crear una sucursal
router.post('/', async (req, res) => {
    try {
        const { nombre, direccion } = req.body;
        const sucursal = await Sucursal.create({ nombre, direccion });
        res.status(201).json(sucursal);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear la sucursal' });
    }
});

// ✅ Obtener todas las sucursales
router.get('/', async (req, res) => {
    try {
        const sucursales = await Sucursal.findAll();
        res.json(sucursales);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener sucursales' });
    }
});

module.exports = router;
