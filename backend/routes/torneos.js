const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// GET /torneos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM torneos ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /torneos
router.post('/', async (req, res) => {
  const t = req.body;
  try {
    await pool.query(
      `INSERT INTO torneos (id, nombre, formato, deporte, fecha, datos)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (id) DO UPDATE SET nombre=$2, formato=$3, deporte=$4, fecha=$5, datos=$6`,
      [t.id, t.name || t.nombre, t.format || t.formato, t.sport || t.deporte, t.startDate || t.fecha, JSON.stringify(t)]
    );
    res.status(201).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /torneos/:id
router.put('/:id', async (req, res) => {
  const t = req.body;
  try {
    await pool.query(
      `UPDATE torneos SET nombre=$1, formato=$2, deporte=$3, fecha=$4, datos=$5
       WHERE id=$6`,
      [t.name || t.nombre, t.format || t.formato, t.sport || t.deporte, t.startDate || t.fecha, JSON.stringify(t), req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /torneos/:id/fixture
router.get('/:id/fixture', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT datos FROM partidos WHERE torneo_id=$1 ORDER BY created_at',
      [req.params.id]
    );
    res.json(rows.map(r => r.datos));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;