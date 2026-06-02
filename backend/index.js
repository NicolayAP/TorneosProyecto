require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./db');

const torneosRouter = require('./routes/torneos');
const partidosRouter = require('./routes/partidos');
const syncRouter = require('./routes/sync');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4173'] }));
app.use(express.json());

app.use('/torneos', torneosRouter);
app.use('/partidos', partidosRouter);
app.use('/sync', syncRouter);

app.get('/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

initSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 TorneoApp backend corriendo en http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Error iniciando DB:', err);
  process.exit(1);
});