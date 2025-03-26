const express = require('express');
const router = express.Router();
const dbEmpresa = require('../config/db_empresa');
const { QueryTypes } = require('sequelize');

// ✅ Obtener un producto por código de barras desde la base `plexdr.medicamentos`
router.get('/:codebar', async (req, res) => {
    try {
        const { codebar } = req.params;

        // Consulta directa a la base de datos externa
        const producto = await dbEmpresa.query(
            `SELECT CodPlex, codebar, Producto, Presentaci, Precio, Costo, Activo 
             FROM medicamentos 
             WHERE medicamentos.IDPerfumeria = 114
             AND codebar = :codebar LIMIT 5`,
            {
                replacements: { codebar },
                type: QueryTypes.SELECT
            }
        );

        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto[0]); // Enviar el producto encontrado

    } catch (error) {
        console.error('❌ Error en la consulta:', error);
        res.status(500).json({ error: 'Error al buscar el producto en la base externa' });
    }
});

module.exports = router;
