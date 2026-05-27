const express = require('express');
const router  = express.Router();
const pool    = require('../db');

router.get('/adentro', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id AS asistencia_id, a.entrada,
        c.id, c.nombre, c.identificacion, c.celular, c.genero,
        COALESCE((SELECT SUM(p.dias_restantes) FROM pagos p WHERE p.cliente_id=c.id),0) AS dias_restantes
      FROM asistencia a JOIN clientes c ON c.id=a.cliente_id
      WHERE a.salida IS NULL ORDER BY a.entrada DESC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error al obtener clientes en gimnasio' }); }
});

router.get('/historial/:cliente_id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM asistencia WHERE cliente_id=? ORDER BY entrada DESC LIMIT 50', [req.params.cliente_id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error al obtener historial' }); }
});

router.post('/ingreso', async (req, res) => {
  const { cliente_id } = req.body;
  if (!cliente_id) return res.status(400).json({ error: 'cliente_id es obligatorio' });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [cli] = await conn.query('SELECT * FROM clientes WHERE id=?', [cliente_id]);
    if (!cli.length) { await conn.rollback(); return res.status(404).json({ error: 'Cliente no encontrado' }); }
    const [adentro] = await conn.query('SELECT id FROM asistencia WHERE cliente_id=? AND salida IS NULL', [cliente_id]);
    if (adentro.length) { await conn.rollback(); return res.status(409).json({ error: 'El cliente ya está dentro del gimnasio' }); }
    const [[{ total }]] = await conn.query('SELECT COALESCE(SUM(dias_restantes),0) AS total FROM pagos WHERE cliente_id=?', [cliente_id]);
    if (parseInt(total) <= 0) { await conn.rollback(); return res.status(402).json({ error: 'El cliente no tiene días disponibles. Debe realizar un pago.' }); }
    await conn.query(`UPDATE pagos SET dias_restantes=dias_restantes-1
      WHERE id=(SELECT id FROM (SELECT id FROM pagos WHERE cliente_id=? AND dias_restantes>0 ORDER BY fecha_pago ASC LIMIT 1) AS sub)`, [cliente_id]);
    const [r] = await conn.query('INSERT INTO asistencia (cliente_id) VALUES (?)', [cliente_id]);
    await conn.commit();
    res.status(201).json({ id: r.insertId, cliente_id, dias_restantes: parseInt(total)-1, mensaje: `Ingreso registrado. Días restantes: ${parseInt(total)-1}` });
  } catch (e) { await conn.rollback(); res.status(500).json({ error: 'Error al registrar ingreso' }); }
  finally { conn.release(); }
});

router.post('/salida', async (req, res) => {
  const { cliente_id } = req.body;
  if (!cliente_id) return res.status(400).json({ error: 'cliente_id es obligatorio' });
  try {
    const [r] = await pool.query('UPDATE asistencia SET salida=NOW() WHERE cliente_id=? AND salida IS NULL', [cliente_id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'No hay ingreso activo para este cliente' });
    res.json({ cliente_id, mensaje: 'Salida registrada correctamente' });
  } catch (e) { res.status(500).json({ error: 'Error al registrar salida' }); }
});

module.exports = router;
