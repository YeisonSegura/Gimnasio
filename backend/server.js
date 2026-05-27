require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const clientesRouter   = require('./routes/clientes');
const pagosRouter      = require('./routes/pagos');
const asistenciaRouter = require('./routes/asistencia');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/clientes',   clientesRouter);
app.use('/api/pagos',      pagosRouter);
app.use('/api/asistencia', asistenciaRouter);

app.get('/api/health', (_, res) => res.json({ status: 'OK', time: new Date() }));

app.listen(PORT, () => {
  console.log(`✅ Backend corriendo en http://localhost:${PORT}`);
});
