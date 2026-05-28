import { useEffect, useState } from 'react';
import api from '../api';

const fmtFecha = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleDateString('es-CO', { day:'2-digit', month:'2-digit', year:'numeric' });
};

const fmtHora = (dt) => {
  if (!dt) return '—';
  const d = new Date(dt);
  return d.toLocaleTimeString('es-CO', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
};

const duracion = (entrada, salida) => {
  if (!salida) return <span className="badge badge-green">Dentro ahora</span>;
  const min = Math.floor((new Date(salida) - new Date(entrada)) / 60000);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)}h ${min % 60}min`;
};

export default function HistorialCliente() {
  const [clientes, setClientes]   = useState([]);
  const [cliSel, setCliSel]       = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading]     = useState(false);
  const [busqueda, setBusqueda]   = useState('');

  useEffect(() => {
    api.get('/clientes').then(r => setClientes(r.data));
  }, []);

  const selCliente = (id) => {
    const c = clientes.find(x => x.id == id) || null;
    setCliSel(c);
    if (!id) { setHistorial([]); return; }
    setLoading(true);
    api.get(`/asistencia/historial/${id}`)
      .then(r => { setHistorial(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.identificacion.includes(busqueda)
  );

  return (
    <div>
      <div className="page-header" style={{background:'#f7f8fa',borderRadius:'10px',padding:'22px 28px 18px',marginBottom:'28px',boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:4,letterSpacing:'-1px'}}>Historial de Asistencia</h1>
          <p style={{fontSize:'1.08rem',color:'var(--muted)',fontWeight:500}}>Registro de ingresos y salidas por cliente</p>
        </div>
        {cliSel && (
          <button className="btn btn-secondary" style={{height:40,alignSelf:'center'}} onClick={() => window.print()}>
            🖨️ Imprimir
          </button>
        )}
      </div>

      {/* Selector de cliente */}
      <div className="card" style={{marginBottom:20}}>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'end'}}>
          <div className="form-group">
            <label>Seleccionar cliente</label>
            <select onChange={e => selCliente(e.target.value)} defaultValue="">
              <option value="">— Selecciona un cliente —</option>
              {clientes.map(c => (
                <option key={c.id} value={c.id}>{c.nombre} — {c.identificacion}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Buscar cliente</label>
            <input
              placeholder="🔍 Nombre o identificación…"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        {/* Lista rápida filtrada */}
        {busqueda && filtrados.length > 0 && (
          <div style={{marginTop:12, border:'1px solid var(--border)', borderRadius:8, overflow:'hidden'}}>
            {filtrados.slice(0,6).map(c => (
              <div key={c.id}
                onClick={() => { setBusqueda(''); selCliente(c.id); document.querySelector('select').value = c.id; }}
                style={{padding:'10px 14px', cursor:'pointer', borderBottom:'1px solid var(--border)',
                  background:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center'}}
                onMouseEnter={e => e.currentTarget.style.background='#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background='#fff'}
              >
                <span><strong>{c.nombre}</strong> — {c.identificacion}</span>
                <span className={parseInt(c.dias_restantes)>0?'dias-ok':'dias-none'}>{c.dias_restantes} días</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info del cliente seleccionado */}
      {cliSel && (
        <div className="card" style={{marginBottom:20, background:'linear-gradient(135deg,#111827,#1d4ed8)', color:'#fff'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12}}>
            <div>
              <div style={{fontSize:'1.25rem', fontWeight:700}}>{cliSel.nombre}</div>
              <div style={{opacity:.75, fontSize:'.9rem', marginTop:4}}>
                {cliSel.identificacion} &nbsp;·&nbsp; {cliSel.celular} &nbsp;·&nbsp; {cliSel.genero}
              </div>
            </div>
            <div style={{display:'flex', gap:20}}>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'1.8rem', fontWeight:700}}>{historial.length}</div>
                <div style={{fontSize:'.75rem', opacity:.7}}>Visitas totales</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'1.8rem', fontWeight:700}}>{cliSel.dias_restantes}</div>
                <div style={{fontSize:'.75rem', opacity:.7}}>Días restantes</div>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:'1.8rem', fontWeight:700}}>
                  {historial.filter(h => !h.salida).length > 0 ? '🟢' : '⚪'}
                </div>
                <div style={{fontSize:'.75rem', opacity:.7}}>
                  {historial.filter(h => !h.salida).length > 0 ? 'Dentro ahora' : 'Fuera'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de historial */}
      <div className="card">
        {!cliSel ? (
          <div className="empty">
            <div style={{fontSize:'2.5rem', marginBottom:8}}>📅</div>
            <p>Selecciona un cliente para ver su historial de asistencia.</p>
          </div>
        ) : loading ? (
          <div className="loading">Cargando historial…</div>
        ) : historial.length === 0 ? (
          <div className="empty">
            <div style={{fontSize:'2.5rem', marginBottom:8}}>🚫</div>
            <p>Este cliente no tiene registros de asistencia aún.</p>
          </div>
        ) : (
          <>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
              <h3 style={{fontSize:'1rem', fontWeight:700}}>
                Historial de {cliSel.nombre.split(' ')[0]} — {historial.length} registro(s)
              </h3>
              <span style={{fontSize:'.82rem', color:'var(--muted)'}}>Últimos 50 registros</span>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha de Ingreso</th>
                    <th>Hora de Ingreso</th>
                    <th>Fecha de Salida</th>
                    <th>Hora de Salida</th>
                    <th>Duración</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((h, i) => (
                    <tr key={h.id}>
                      <td style={{color:'var(--muted)'}}>{i + 1}</td>
                      <td><strong>{fmtFecha(h.entrada)}</strong></td>
                      <td>{fmtHora(h.entrada)}</td>
                      <td>{fmtFecha(h.salida)}</td>
                      <td>{fmtHora(h.salida)}</td>
                      <td>{duracion(h.entrada, h.salida)}</td>
                      <td>
                        {h.salida
                          ? <span className="badge badge-blue">Completado</span>
                          : <span className="badge badge-green">Dentro ahora</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      <div style={{fontSize:'.78rem', color:'var(--muted)', marginTop:4}}>
        Historial generado el {new Date().toLocaleString('es-CO')} — GimnasioPro
      </div>
    </div>
  );
}