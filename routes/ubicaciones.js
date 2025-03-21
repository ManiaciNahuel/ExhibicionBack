const express = require('express');
const router = express.Router();
const { Ubicacion, Producto } = require('../models');

// ✅ Asignar producto a una ubicación estructurada
router.post('/', async (req, res) => {
    try {
        const { productoId, tipoUbicacion, numeroUbicacion, subdivision, cantidad } = req.body;

        const codigoUbicacion = `${tipoUbicacion}${numeroUbicacion}${subdivision || ''}`;

        let ubicacion = await Ubicacion.findOne({ 
            where: { productoId, codigoUbicacion } 
        });

        if (ubicacion) {
            ubicacion.cantidad += cantidad;
            await ubicacion.save();
        } else {
            ubicacion = await Ubicacion.create({
                productoId,
                tipoUbicacion,
                numeroUbicacion,
                subdivision,
                cantidad,
                codigoUbicacion
            });
        }

        res.status(201).json(ubicacion);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al asignar producto a ubicación' });
    }
});


// ✅ Obtener todos los productos asignados a ubicaciones
router.get('/', async (req, res) => {
    try {
        const ubicaciones = await Ubicacion.findAll({
            include: [{ model: Producto, attributes: ['nombre', 'codigoBarras', 'marca'] }]
        });
        res.json(ubicaciones);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las ubicaciones' });
    }
});

module.exports = router;
