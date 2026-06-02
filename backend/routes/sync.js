const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /sync/bulk — recibe toda la cola offline del frontend
router.post('/bulk', async (req, res) => {
  const { changes } = req.body; // Array de OfflineChange

  if (!Array.isArray(changes) || changes.length === 0) {
    return res.json({ ok: true, processed: 0 });
  }

  let processed = 0;
  const errors = [];

  for (const change of changes) {
    try {
      await pool.query(
        `INSERT INTO sync_log (tipo, payload, timestamp, resuelto)
         VALUES ($1, $2, $3, TRUE)`,
        [change.type, JSON.stringify(change.payload), change.timestamp]
      );

      // Aplicar el cambio según su tipo
      if (change.type === 'create_tournament' || change.type === 'update_tournament') {
        const t = change.payload;
        await pool.query(
          `INSERT INTO torneos (id, nombre, formato, deporte, fecha, datos)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (id) DO UPDATE SET nombre=$2, datos=$6`,
          [t.id, t.name || t.nombre, t.format, t.sport, t.startDate, JSON.stringify(t)]
        );
      }

      if (change.type === 'finalize_match' || change.type === 'record_match_event') {
        const p = change.payload;
        if (p.matchId || p.id) {
          await pool.query(
            `INSERT INTO partidos (id, torneo_id, goles_local, goles_visita, jugado, datos, updated_at)
             VALUES ($1,$2,$3,$4,$5,$6,NOW())
             ON CONFLICT (id) DO UPDATE
             SET goles_local=$3, goles_visita=$4, jugado=$5, datos=$6, updated_at=NOW()`,
            [
              p.matchId || p.id,
              p.tournamentId || 'unknown',
              p.scoreA ?? 0,
              p.scoreB ?? 0,
              change.type === 'finalize_match',
              JSON.stringify(p)
            ]
          );
        }
      }

      processed++;
    } catch (err) {
      errors.push({ changeId: change.id, error: err.message });
    }
  }

  res.json({ ok: true, processed, errors });
});

// GET /sync/status — cuántos registros tiene el backend
router.get('/status', async (req, res) => {
  try {
    const torneos = await pool.query('SELECT COUNT(*) FROM torneos');
    const partidos = await pool.query('SELECT COUNT(*) FROM partidos');
    const logs = await pool.query('SELECT COUNT(*) FROM sync_log');
    res.json({
      torneos: parseInt(torneos.rows[0].count),
      partidos: parseInt(partidos.rows[0].count),
      sync_log: parseInt(logs.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;