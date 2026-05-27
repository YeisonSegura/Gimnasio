const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// GET /api/clientes
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.id, c.nombre, c.identificacion, c.celular,
        DATE_FORMAT(c.fecha_inscripcion,'%Y-%m-%d') AS fecha_inscripcion,
        c.genero,
        COALESCE((SELECT SUM(p.dias_restantes) FROM pagos p WHERE p.cliente_id=c.id),0) AS dias_restantes
      FROM clientes c ORDER BY c.nombre ASC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error al obtener clientes' }); }
});

// GET /api/clientes/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, DATE_FORMAT(c.fecha_inscripcion,'%Y-%m-%d') AS fecha_inscripcion,
        COALESCE((SELECT SUM(p.dias_restantes) FROM pagos p WHERE p.cliente_id=c.id),0) AS dias_restantes
       FROM clientes c WHERE c.id=?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al obtener cliente' }); }
});

// POST /api/clientes
router.post('/', async (req, res) => {
  const { nombre, identificacion, celular, fecha_inscripcion, genero } = req.body;
  if (!nombre || !identificacion || !celular || !genero)
    return res.status(400).json({ error: 'Campos obligatorios: nombre, identificacion, celular, genero' });
  try {
    const fecha = fecha_inscripcion || new Date().toISOString().split('T')[0];
    const [r] = await pool.query(
      'INSERT INTO clientes (nombre,identificacion,celular,fecha_inscripcion,genero) VALUES (?,?,?,?,?)',
      [nombre.trim(), identificacion.trim(), celular.trim(), fecha, genero]);
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un cliente con esa identificación' });
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
  const { nombre, identificacion, celular, fecha_inscripcion, genero } = req.body;
  try {
    const [r] = await pool.query(
      'UPDATE clientes SET nombre=?,identificacion=?,celular=?,fecha_inscripcion=?,genero=? WHERE id=?',
      [nombre.trim(), identificacion.trim(), celular.trim(), fecha_inscripcion, genero, req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Cliente no encontrado' });
    const [rows] = await pool.query('SELECT * FROM clientes WHERE id=?', [req.params.id]);
    res.json(rows[0]);
  } catch (e) {
    if (e.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Ya existe un cliente con esa identificación' });
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
  try {
    const [r] = await pool.query('DELETE FROM clientes WHERE id=?', [req.params.id]);
    if (!r.affectedRows) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ message: 'Cliente eliminado correctamente' });
  } catch (e) { res.status(500).json({ error: 'Error al eliminar cliente' }); }
});

module.exports = router;
