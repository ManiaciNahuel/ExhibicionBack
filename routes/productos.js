const express = require('express');
const router = express.Router();
const dbEmpresa = require('../config/db_empresa');
const { QueryTypes } = require('sequelize');

// ✅ Obtener un producto por código de barras usando unión de tablas
router.get('/:codebar', async (req, res) => {
    try {
        const { codebar } = req.params;

        // Realizamos la unión de las dos tablas para encontrar el IDProducto (CodPlex)
        const codigoResult = await dbEmpresa.query(
            `SELECT * FROM (
         SELECT productoscodebars.IDProducto AS IDProducto, productoscodebars.codebar AS Codebar
         FROM productoscodebars 
         LEFT JOIN medicamentos ON medicamentos.CodPlex = productoscodebars.IDProducto
         WHERE medicamentos.Activo = 's'
         UNION ALL
         SELECT medicamentos.CodPlex AS IDProducto, medicamentos.Codebar AS Codebar
         FROM medicamentos
         WHERE medicamentos.Activo = 's'
       ) AS codigos
       WHERE codigos.Codebar = :codebar
       LIMIT 1`,
            {
                replacements: { codebar },
                type: QueryTypes.SELECT
            }
        );

        if (codigoResult.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        // Una vez obtenido el IDProducto (CodPlex), consultamos la tabla medicamentos para traer los datos completos
        const producto = await dbEmpresa.query(
            `SELECT CodPlex, codebar, Producto, Presentaci, Precio, Costo, Activo
       FROM medicamentos 
       WHERE CodPlex = :codPlex
       LIMIT 1`,
            {
                replacements: { codPlex: codigoResult[0].IDProducto },
                type: QueryTypes.SELECT
            }
        );

        if (producto.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }

        res.json(producto[0]); // Retorna el producto completo

    } catch (error) {
        console.error('❌ Error en la consulta:', error);
        res.status(500).json({ error: 'Error al buscar el producto en la base externa' });
    }
});

module.exports = router;
