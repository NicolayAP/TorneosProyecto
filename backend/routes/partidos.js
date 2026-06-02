const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// POST /partidos/sync  — sincroniza un partido con resolución de conflictos
router.post('/sync', async (req, res) => {
  const partido = req.body; // { id, torneoId, golesLocal, golesVisita, jugado, updatedAt, ...datos }

  try {
    // Resolución de conflictos: gana el último timestamp
    const existing = await pool.query('SELECT datos FROM partidos WHERE id=$1', [partido.id]);

    if (existing.rows.length > 0) {
      const existingData = existing.rows[0].datos;
      const incomingTs = new Date(partido.updatedAt || 0).getTime();
      const existingTs = new Date(existingData.updatedAt || 0).getTime();

      if (incomingTs < existingTs) {
        // Log de conflicto — el existente gana
        await pool.query(
          `INSERT INTO sync_log (tipo, payload, timestamp) VALUES ('conflict_rejected', $1, NOW())`,
          [JSON.stringify({ incoming: partido, existing: existingData })]
        );
        return res.json({ ok: true, conflict: true, winner: 'existing' });
      }
    }

    await pool.query(
      `INSERT INTO partidos (id, torneo_id, equipo_local_id, equipo_visita_id, goles_local, goles_visita, jugado, datos, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW())
       ON CONFLICT (id) DO UPDATE
       SET goles_local=$5, goles_visita=$6, jugado=$7, datos=$8, updated_at=NOW()`,
      [
        partido.id,
        partido.tournamentId || partido.torneo_id,
        partido.teamAId || partido.equipo_local_id,
        partido.teamBId || partido.equipo_visita_id,
        partido.scoreA ?? partido.goles_local ?? 0,
        partido.scoreB ?? partido.goles_visita ?? 0,
        partido.status === 'finished',
        JSON.stringify(partido)
      ]
    );

    res.json({ ok: true, conflict: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;