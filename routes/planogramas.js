const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const { Planograma } = require('../models');

// 📂 Configuración de multer para guardar imágenes en 'uploads/'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// ✅ Ruta para subir un planograma con imagen
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const { sucursalId, nombre } = req.body;
        const imagen = req.file ? `/uploads/${req.file.filename}` : null;

        const planograma = await Planograma.create({ sucursalId, nombre, imagen });
        res.status(201).json(planograma);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el planograma' });
    }
});

// ✅ Ruta para obtener todos los planogramas
router.get('/', async (req, res) => {
    try {
        const planogramas = await Planograma.findAll();
        res.json(planogramas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener planogramas' });
    }
});

module.exports = router;
