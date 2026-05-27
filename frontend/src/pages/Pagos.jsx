import { useEffect, useState } from 'react';
import api from '../api';

const fmt = v => new Intl.NumberFormat('es-CO',{style:'currency',currency:'COP',maximumFractionDigits:0}).format(v);

const TARIFAS = [
  { label:'1 día',          dias:1,   valor:8000,    desc:'$8.000/día' },
  { label:'5 días',         dias:5,   valor:40000,   desc:'$8.000/día' },
  { label:'10 días',        dias:10,  valor:80000,   desc:'$8.000/día' },
  { label:'Quincenal',      dias:15,  valor:50000,   desc:'15 días' },
  { label:'Mensual',        dias:30,  valor:90000,   desc:'30 días' },
  { label:'Anual',          dias:365, valor:1000000, desc:'365 días' },
];

export default function Pagos() {
  const [clientes, setClientes]   = useState([]);
  const [cliSel, setCliSel]       = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tarifaSel, setTarifaSel] = useState(TARIFAS[3]); // quincenal por defecto
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [msg, setMsg]             = useState(null);

  useEffect(() => { api.get('/clientes').then(r => setClientes(r.data)); }, []);

  const selCliente = (id) => {
    const c = clientes.find(x => x.id == id) || null;
    setCliSel(c);
    if (id) api.get(`/pagos/cliente/${id}`).then(r => setHistorial(r.data)).catch(()=>setHistorial([]));
    else    setHistorial([]);
    setMsg(null);
  };

  const registrarPago = async () => {
    if (!cliSel) return setMsg({ tipo:'error', texto:'Selecciona un cliente' });
    try {
      await api.post('/pagos', {
        cliente_id:  cliSel.id,
        fecha_pago:  fechaPago,
        dias_pagados: tarifaSel.dias,
        valor:        tarifaSel.valor,
      });
      setMsg({ tipo:'success', texto:`✅ Pago de ${fmt(tarifaSel.valor)} registrado correctamente` });
      selCliente(cliSel.id);
      api.get('/clientes').then(r => setClientes(r.data));
    } catch (e) {
      setMsg({ tipo:'error', texto: e.response?.data?.error || 'Error al registrar pago' });
    }
  };

  return (
    <div>
      <div className="page-header" style={{background:'#f7f8fa',borderRadius:'10px',padding:'22px 28px 18px',marginBottom:'28px',boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:4,letterSpacing:'-1px'}}>Registro de Pagos</h1>
          <p style={{fontSize:'1.08rem',color:'var(--muted)',fontWeight:500}}>Ingreso de pagos por periodo</p>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>

        {/* ── Formulario ── */}
        <div className="card">
          <h3 style={{marginBottom:16,fontSize:'1rem'}}>Nuevo pago</h3>
          {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

          <div className="form-group" style={{marginBottom:12}}>
            <label>Cliente *</label>
            <select onChange={e=>selCliente(e.target.value)} defaultValue="">
              <option value="">— Seleccionar cliente —</option>
              {clientes.map(c=>(
                <option key={c.id} value={c.id}>{c.nombre} — {c.identificacion}</option>
              ))}
            </select>
          </div>

          {cliSel && (
            <div className="alert alert-info" style={{marginBottom:12}}>
              Días restantes actuales: <strong>{cliSel.dias_restantes}</strong>
            </div>
          )}

          <div className="form-group" style={{marginBottom:14}}>
            <label>Fecha del pago</label>
            <input type="date" value={fechaPago} onChange={e=>setFechaPago(e.target.value)} />
          </div>

          <label style={{fontSize:'.82rem',fontWeight:600,display:'block',marginBottom:9}}>Seleccionar tarifa *</label>
          <div className="tarifa-grid">
            {TARIFAS.map(t => (
              <div key={t.dias} className={`tarifa-card${tarifaSel.dias===t.dias?' selected':''}`} onClick={()=>setTarifaSel(t)}>
                <div className="dias">{t.label}</div>
                <div className="valor">{fmt(t.valor)}</div>
              </div>
            ))}
          </div>

          <div className="resumen-pago">
            <div className="fila"><span>Días a pagar:</span><strong>{tarifaSel.dias}</strong></div>
            <div className="fila"><span>Periodo:</span><strong>{tarifaSel.label}</strong></div>
            <div className="total"><span>Total a cobrar:</span><span>{fmt(tarifaSel.valor)}</span></div>
          </div>

          <button className="btn btn-success" style={{width:'100%'}} onClick={registrarPago}>
            💳 Registrar Pago
          </button>
        </div>

        {/* ── Historial ── */}
        <div className="card">
          <h3 style={{marginBottom:14,fontSize:'1rem'}}>
            Historial de pagos {cliSel ? `— ${cliSel.nombre.split(' ')[0]}` : ''}
          </h3>
          {!cliSel
            ? <div className="empty"><p>Selecciona un cliente para ver su historial.</p></div>
            : historial.length === 0
              ? <div className="empty"><p>Sin pagos registrados.</p></div>
              : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Fecha</th><th>Días pag.</th><th>Días rest.</th><th>Valor</th></tr></thead>
                <tbody>
                  {historial.map(p => (
                    <tr key={p.id}>
                      <td>{new Date(p.fecha_pago).toLocaleDateString('es-CO')}</td>
                      <td>{p.dias_pagados}</td>
                      <td><span className={parseInt(p.dias_restantes)>0?'dias-ok':'dias-none'}>{p.dias_restantes}</span></td>
                      <td>{fmt(p.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
