const express = require('express');
const router = express.Router();
const { ProductoUbicacion, sequelize, UbicacionesPermitidas } = require('../models');
const dbEmpresa = require('../config/db_empresa');
const db = require('../models');
const { Ubicacion, Producto } = require('../models');
const { Op } = require('sequelize');

// ubicaciones.js (backend)

// 📦 Crear una nueva ubicación de producto
router.post('/', async (req, res) => {
  const {
    codebar,
    tipo,
    numero,
    subdivision,
    numeroSubdivision: rawNumeroSubdivision,
    division,
    numeroDivision: rawNumeroDivision,
    cantidad,
    sucursalId
  } = req.body;

  const numeroSubdivision = rawNumeroSubdivision !== null && rawNumeroSubdivision !== undefined
    ? parseInt(rawNumeroSubdivision)
    : null;

  const numeroDivision = rawNumeroDivision !== null && rawNumeroDivision !== undefined
    ? parseInt(rawNumeroDivision)
    : null;


  if (!codebar || !tipo || !numero || !sucursalId || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos obligatorios en la solicitud' });
  }


  try {
    const ubicacionPermitida = await UbicacionesPermitidas.findOne({
      where: {
        idSucursal: sucursalId,
        tipo,
        numeroUbicacion: numero,
        subdivision,
        numeroSubdivision,
        division,
        numeroDivision
      }
    });



    if (!ubicacionPermitida) {
      return res.status(403).json({ error: 'Ubicación no permitida para esta sucursal' });
    }

    const [producto] = await dbEmpresa.query(
      `SELECT * FROM (
     SELECT productoscodebars.IDProducto AS IDProducto, productoscodebars.codebar AS Codebar
     FROM productoscodebars 
     LEFT JOIN medicamentos ON medicamentos.CodPlex = productoscodebars.IDProducto
     WHERE medicamentos.Activo = 's'
       AND (medicamentos.IDPerfumeria = 114 OR medicamentos.IDPerfumeria IS NULL)
     UNION ALL
     SELECT medicamentos.CodPlex AS IDProducto, medicamentos.Codebar AS Codebar
     FROM medicamentos
     WHERE medicamentos.Activo = 's'
       AND (medicamentos.IDPerfumeria = 114 OR medicamentos.IDPerfumeria IS NULL)
   ) AS codigos
   WHERE codigos.Codebar = :codebar
   LIMIT 1`,
      {
        replacements: { codebar },
        type: dbEmpresa.QueryTypes.SELECT
      }
    );

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado con ese código de barras' });
    }

    // Creamos la ubicación del producto
    const ubicacion = `${tipo}${numero}${division || ''}${numeroDivision || ''}${subdivision || ''}${numeroSubdivision || ''}`;

    const nuevaUbicacion = await ProductoUbicacion.create({
      codebar,
      codplex: producto.IDProducto,
      tipo,
      numero,
      subdivision,
      numeroSubdivision,
      division,
      numeroDivision,
      cantidad,
      sucursalId,
      ubicacion
    });
    res.json(nuevaUbicacion);
  } catch (error) {
    console.error("❌ Error al crear producto:", error);
    res.status(500).json({ error: 'Error interno al crear producto' });
  }
});




// ✅ Obtener ubicaciones permitidas por sucursal
router.get('/permitidas', async (req, res) => {
  const { sucursalId } = req.query;

  if (!sucursalId) {
    return res.status(400).json({ error: 'Falta el parámetro sucursalId' });
  }

  try {
    const ubicaciones = await sequelize.query(`
  SELECT 
    up.id, up.idSucursal, up.sucursal, up.tipo, up.numeroUbicacion,
    up.subdivision, up.numeroSubdivision, up.idCategoria,
    c.nombre as categoria
  FROM UbicacionesPermitidas up
  LEFT JOIN Categorias c ON up.idCategoria = c.id
  WHERE up.idSucursal = :sucursalId
  ORDER BY up.tipo, up.numeroUbicacion, up.numeroSubdivision
`, {
      replacements: { sucursalId },
      type: sequelize.QueryTypes.SELECT
    });


    res.json(ubicaciones);
  } catch (error) {
    console.error('❌ Error al obtener ubicaciones permitidas:', error);
    res.status(500).json({ error: 'Error interno al consultar ubicaciones permitidas' });
  }
});


// 📥 GET /ubicaciones?sucursal=1&ubicacion=G1E2
router.get('/', async (req, res) => {
  const { sucursal, ubicacion } = req.query;


  if (!sucursal || !ubicacion) {
    return res.status(400).json({ error: 'Faltan parámetros: sucursal y/o ubicación' });
  }

  try {
    const registros = await ProductoUbicacion.findAll({
      where: {
        sucursalId: sucursal,
        ubicacion: ubicacion
      },
      order: [['createdAt', 'DESC']]
    });


    const resultado = [];

    for (const r of registros) {
      const [producto] = await dbEmpresa.query(
        `SELECT Producto, Presentaci FROM medicamentos WHERE codebar = :codebar AND IDPerfumeria = 114 LIMIT 1`,
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


// GET /ubicaciones/todas?sucursalId=8
router.get('/todas', async (req, res) => {
  const { sucursalId } = req.query;

  try {
    const registros = await ProductoUbicacion.findAll({
      where: { sucursalId },
      order: [['ubicacion', 'ASC']],
    });

    const agrupado = {};

    for (const r of registros) {
      const codebar = r.codebar;
      const [producto] = await dbEmpresa.query(`
        SELECT Producto, Presentaci FROM medicamentos
        WHERE codebar = :codebar AND IDPerfumeria = 114
        LIMIT 1
      `, {
        replacements: { codebar },
        type: dbEmpresa.QueryTypes.SELECT
      });

      const ubic = r.ubicacion;
      if (!agrupado[ubic]) agrupado[ubic] = [];

      agrupado[ubic].push({
        id: r.id,
        codebar: r.codebar,
        cantidad: r.cantidad,
        nombre: `${producto.Producto || ''} ${producto.Presentaci || ''}`.trim() || 'Sin nombre'
      });

    }

    const resultado = Object.entries(agrupado).map(([ubicacion, productos]) => ({
      ubicacion,
      productos
    }));

    res.json(resultado);
  } catch (error) {
    console.error("❌ Error al traer ubicaciones completas:", error);
    res.status(500).json({ error: "Error al traer ubicaciones" });
  }
});

// GET /ubicaciones/txt
router.get('/txt', async (req, res) => {
  const { sucursal, tipo, numero, division, numeroDivision, ubicacion } = req.query;

  if (!sucursal) {
    return res.status(400).json({ error: 'Falta el parámetro sucursal' });
  }

  const filtros = {
    sucursalId: Number(sucursal)
  };

  let nombreArchivo = '';

  if (ubicacion) {
    // Si la ubicación es corta (por ejemplo, "G8P1" o "M6") utilizamos LIKE para abarcar todas sus subdivisiones
    if (ubicacion.length <= 4) {
      filtros.ubicacion = { [Op.like]: `${ubicacion}%` };
    } else {
      filtros.ubicacion = ubicacion;
    }
    nombreArchivo = ubicacion;
  } else {
    if (!tipo || !numero) {
      return res.status(400).json({ error: 'Faltan datos para generar el archivo' });
    }
    filtros.tipo = tipo;
    filtros.numero = Number(numero);
    nombreArchivo = tipo + numero;

    if (tipo === 'G') {
      // Para las góndolas, si no se proporcionó division y numeroDivision,
      // usamos LIKE para obtener todas las subdivisiones
      if (!division || !numeroDivision) {
        filtros.ubicacion = { [Op.like]: `${tipo}${numero}%` };
      } else {
        filtros.division = division;
        filtros.numeroDivision = Number(numeroDivision);
        nombreArchivo += `_${division}${numeroDivision}`;
      }
    }
  }

  try {
    const registros = await db.ProductoUbicacion.findAll({
      where: filtros,
      order: [['ubicacion', 'ASC']]
    });

    const contenido = registros.map(p => `${p.codebar || ''};`).join('\n');

    res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo}.txt`);
    res.setHeader('Content-Type', 'text/plain');
    res.send(contenido);
  } catch (err) {
    console.error("❌ Error generando archivo:", err);
    res.status(500).json({ error: 'Error al generar archivo' });
  }
});

module.exports = router;

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

// GET /ubicaciones/producto?codebar=123&sucursalId=8
router.get('/producto', async (req, res) => {
  const { codebar, sucursalId } = req.query;

  if (!codebar || !sucursalId) {
    return res.status(400).json({ error: 'Faltan parámetros' });
  }

  try {
    const ubicaciones = await ProductoUbicacion.findAll({
      where: {
        codebar,
        sucursalId
      },
      order: [['ubicacion', 'ASC']]
    });

    res.json(ubicaciones);
  } catch (err) {
    console.error('❌ Error en /ubicaciones/producto:', err);
    res.status(500).json({ error: 'Error interno al buscar ubicaciones del producto' });
  }
});

// 🔎 Buscar ubicaciones de un producto por código de barras
router.get('/producto/:codebar', async (req, res) => {
  const { codebar } = req.params;
  const { sucursalId } = req.query;

  if (!codebar || !sucursalId) {
    return res.status(400).json({ error: 'Faltan parámetros: codebar o sucursalId' });
  }

  try {
    const ubicaciones = await ProductoUbicacion.findAll({
      where: { codebar, sucursalId },
      attributes: ['id', 'tipo', 'numero', 'subdivision', 'numeroSubdivision', 'cantidad']
    });

    res.json(ubicaciones);
  } catch (err) {
    console.error("❌ Error al obtener ubicaciones del producto:", err);
    res.status(500).json({ error: 'Error interno al obtener ubicaciones del producto' });
  }
});


module.exports = router;
