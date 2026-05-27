const express = require('express');
const router  = express.Router();
const pool    = require('../db');

function calcularValor(dias) {
  if (dias === 365) return 1000000;
  if (dias === 30)  return 90000;
  if (dias === 15)  return 50000;
  return dias * 8000;
}

router.get('/tarifa/:dias', (req, res) => {
  const dias = parseInt(req.params.dias);
  if (isNaN(dias) || dias < 1 || dias > 365)
    return res.status(400).json({ error: 'Días debe estar entre 1 y 365' });
  res.json({ dias, valor: calcularValor(dias) });
});

router.get('/cliente/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT *, DATE_FORMAT(fecha_pago,'%Y-%m-%d') AS fecha_pago
       FROM pagos WHERE cliente_id=? ORDER BY fecha_pago DESC`, [req.params.id]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: 'Error al obtener pagos' }); }
});

router.post('/', async (req, res) => {
  let { cliente_id, fecha_pago, dias_pagados, valor } = req.body;
  dias_pagados = parseInt(dias_pagados);
  if (!cliente_id || !dias_pagados || dias_pagados < 1 || dias_pagados > 365)
    return res.status(400).json({ error: 'cliente_id y dias_pagados (1-365) son obligatorios' });

  const valorEsperado = calcularValor(dias_pagados);
  const valorRecibido = valor === undefined || valor === null ? valorEsperado : Number(valor);
  if (Number.isNaN(valorRecibido))
    return res.status(400).json({ error: 'El valor del pago debe ser numérico' });
  if (Math.abs(valorRecibido - valorEsperado) > 0.01)
    return res.status(400).json({ error: `Valor inválido para ${dias_pagados} días. Debe ser ${new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(valorEsperado)}` });

  const valorFinal = valorEsperado;
  const fecha = fecha_pago || new Date().toISOString().split('T')[0];
  try {
    const [cli] = await pool.query('SELECT id FROM clientes WHERE id=?', [cliente_id]);
    if (!cli.length) return res.status(404).json({ error: 'Cliente no encontrado' });
    const [r] = await pool.query(
      'INSERT INTO pagos (cliente_id,fecha_pago,dias_pagados,valor,dias_restantes) VALUES (?,?,?,?,?)',
      [cliente_id, fecha, dias_pagados, valorFinal, dias_pagados]);
    const [rows] = await pool.query('SELECT * FROM pagos WHERE id=?', [r.insertId]);
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: 'Error al registrar pago' }); }
});

module.exports = router;
