import { useEffect, useState } from 'react';
import api from '../api';

export default function Asistencia() {
  const [clientes, setClientes] = useState([]);
  const [adentro, setAdentro]   = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(true);

  const cargarAdentro  = () => api.get('/asistencia/adentro').then(r => setAdentro(r.data));
  const cargarClientes = () => { setLoading(true); api.get('/clientes').then(r => { setClientes(r.data); setLoading(false); }); };

  useEffect(() => { cargarAdentro(); cargarClientes(); }, []);

  const mostrar = (texto, tipo='success') => {
    setMsg({ texto, tipo });
    setTimeout(() => setMsg(null), 4500);
  };

  const registrarIngreso = async (c) => {
    try {
      const r = await api.post('/asistencia/ingreso', { cliente_id: c.id });
      mostrar(`✅ ${r.data.mensaje}`);
      cargarAdentro(); cargarClientes();
    } catch (e) {
      mostrar(e.response?.data?.error || 'Error al registrar ingreso', 'error');
    }
  };

  const registrarSalida = async (c) => {
    try {
      await api.post('/asistencia/salida', { cliente_id: c.id || c });
      mostrar(`🚪 Salida registrada correctamente`);
      cargarAdentro(); cargarClientes();
    } catch (e) {
      mostrar(e.response?.data?.error || 'Error al registrar salida', 'error');
    }
  };

  const idsAdentro = new Set(adentro.map(a => a.id));
  const filtrados  = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.identificacion.includes(busqueda)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Ingresos y Salidas</h1>
          <p>Control de acceso al gimnasio — descuenta 1 día por ingreso (RF03 / RF04)</p>
        </div>
        <span className="badge badge-green" style={{fontSize:'.95rem',padding:'7px 14px'}}>
          🟢 {adentro.length} dentro ahora
        </span>
      </div>

      {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:22}}>

        {/* ── Lista de clientes ── */}
        <div className="card">
          <h3 style={{marginBottom:12,fontSize:'1rem'}}>Registrar ingreso</h3>
          <div className="search-bar">
            <input placeholder="🔍 Buscar cliente…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          </div>
          {loading ? <div className="loading">Cargando…</div> : (
          <div className="table-wrapper" style={{maxHeight:460,overflowY:'auto'}}>
            <table>
              <thead><tr><th>Cliente</th><th>Días rest.</th><th>Estado</th><th>Acción</th></tr></thead>
              <tbody>
                {filtrados.map(c => {
                  const dentro  = idsAdentro.has(c.id);
                  const sinDias = parseInt(c.dias_restantes) <= 0;
                  return (
                    <tr key={c.id}>
                      <td>
                        <strong style={{display:'block'}}>{c.nombre}</strong>
                        <small style={{color:'var(--muted)'}}>{c.identificacion}</small>
                      </td>
                      <td><span className={sinDias?'dias-none':parseInt(c.dias_restantes)<=3?'dias-warn':'dias-ok'}>{c.dias_restantes}</span></td>
                      <td>
                        {dentro   && <span className="badge badge-green">Dentro</span>}
                        {!dentro && !sinDias && <span className="badge badge-blue">Afuera</span>}
                        {!dentro && sinDias  && <span className="badge badge-red">Sin días</span>}
                      </td>
                      <td>
                        {!dentro && !sinDias && <button className="btn btn-success btn-sm" onClick={()=>registrarIngreso(c)}>➡️ Ingreso</button>}
                        {dentro  && <button className="btn btn-danger btn-sm" onClick={()=>registrarSalida(c)}>⬅️ Salida</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* ── Dentro ahora ── */}
        <div className="card">
          <h3 style={{marginBottom:14,fontSize:'1rem'}}>🟢 Actualmente en el gimnasio</h3>
          {adentro.length === 0
            ? <div className="empty"><p>No hay clientes dentro del gimnasio.</p></div>
            : (
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Cliente</th><th>Entrada</th><th>Días rest.</th><th>Acción</th></tr></thead>
                <tbody>
                  {adentro.map(a => (
                    <tr key={a.asistencia_id}>
                      <td>
                        <strong style={{display:'block'}}>{a.nombre}</strong>
                        <small style={{color:'var(--muted)'}}>{a.identificacion}</small>
                      </td>
                      <td>{new Date(a.entrada).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                      <td><span className="dias-ok">{a.dias_restantes}</span></td>
                      <td><button className="btn btn-danger btn-sm" onClick={()=>registrarSalida(a)}>⬅️ Salida</button></td>
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
