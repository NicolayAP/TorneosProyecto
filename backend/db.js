const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/torneoapp',
});

async function initSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS torneos (
      id          TEXT PRIMARY KEY,
      nombre      TEXT NOT NULL,
      formato     TEXT,
      deporte     TEXT,
      fecha       TEXT,
      datos       JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS partidos (
      id              TEXT PRIMARY KEY,
      torneo_id       TEXT REFERENCES torneos(id) ON DELETE CASCADE,
      equipo_local_id TEXT,
      equipo_visita_id TEXT,
      goles_local     INT DEFAULT 0,
      goles_visita    INT DEFAULT 0,
      jugado          BOOLEAN DEFAULT FALSE,
      datos           JSONB,
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS eventos (
      id          SERIAL PRIMARY KEY,
      partido_id  TEXT REFERENCES partidos(id) ON DELETE CASCADE,
      tipo        TEXT,
      jugador_id  TEXT,
      minuto      INT,
      equipo_id   TEXT,
      datos       JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id          SERIAL PRIMARY KEY,
      tipo        TEXT,
      payload     JSONB,
      timestamp   TIMESTAMPTZ,
      resuelto    BOOLEAN DEFAULT FALSE,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Schema listo');
}

module.exports = { pool, initSchema };