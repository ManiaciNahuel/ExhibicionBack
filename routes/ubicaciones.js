const express = require('express');
const router = express.Router();
const { ProductoUbicacion } = require('../models');
const dbEmpresa = require('../config/db_empresa');

router.post('/', async (req, res) => {
  const { codebar, tipo, numero, subdivision, cantidad, sucursalId } = req.body;

  if (!codebar || !tipo || !numero || !cantidad || !sucursalId) {
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const ubicacion = `${tipo}${numero}${subdivision || ''}`;

    const nueva = await ProductoUbicacion.create({
      codebar,
      tipo,
      numero,
      subdivision,
      cantidad,
      ubicacion: `${tipo}${numero}${subdivision || ''}`,
      sucursalId
    });

    res.status(201).json(nueva);
  } catch (error) {
    console.error('❌ Error al registrar ubicación:', error);
    res.status(500).json({ error: 'Error al consultar ubicaciones', detalle: error.message });
  }
});

// 📥 GET /ubicaciones?sucursal=1&ubicacion=G1E2
router.get('/', async (req, res) => {
  const { sucursal, ubicacion } = req.query;

  if (!sucursal || !ubicacion) {
    return res.status(400).json({ error: 'Faltan parámetros: sucursal y/o ubicación' });
  }

  try {
    // Traemos los registros desde nuestra base
    const registros = await ProductoUbicacion.findAll({
      where: {
        sucursalId: sucursal,
        ubicacion: ubicacion
      },
      order: [['createdAt', 'DESC']]
    });

    // Traer info del producto desde base externa (por cada codebar único)
    const resultado = [];

    for (const r of registros) {
      const [producto] = await dbEmpresa.query(
        `
          SELECT Producto, Presentaci
          FROM medicamentos
          WHERE codebar = :codebar
          AND IDPerfumeria = 114
          LIMIT 1
          `,
        {
          replacements: { codebar: r.codebar },
          type: dbEmpresa.QueryTypes.SELECT
        }
      );

      resultado.push({
        ...r.toJSON(),
        producto: producto ? {
          nombre: producto.Producto,
          presentacion: producto.Presentaci
        } : null
      });
    }

    res.json(resultado);
  } catch (error) {
    console.error('❌ Error al consultar ubicaciones:', error);
    res.status(500).json({ error: 'Error al consultar ubicaciones' });
  }
});

router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { cantidad, sucursalId } = req.body;

  if (!cantidad || !sucursalId) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    const registro = await ProductoUbicacion.findOne({
      where: { id, sucursalId }
    });

    if (!registro) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    registro.cantidad = cantidad;
    await registro.save();

    res.json({ mensaje: 'Cantidad actualizada correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar cantidad:', err);
    res.status(500).json({ error: 'Error interno al actualizar' });
  }
});

// GET /ubicaciones/check?codebar=123&sucursalId=8
router.get('/check', async (req, res) => {
  const { codebar, sucursalId } = req.query;

  if (!codebar || !sucursalId) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const existentes = await ProductoUbicacion.findAll({
      where: {
        codebar,
        sucursalId
      }
    });

    res.json(existentes);
  } catch (err) {
    console.error('Error en /ubicaciones/check:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  try {
    const deleted = await ProductoUbicacion.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: 'Producto no encontrado o ya eliminado' });
    }

    res.json({ mensaje: 'Producto eliminado de la ubicación' });
  } catch (err) {
    console.error('❌ Error al eliminar producto de ubicación:', err);
    res.status(500).json({ error: 'Error interno al eliminar' });
  }
});


module.exports = router;
