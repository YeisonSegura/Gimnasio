import { useEffect, useState } from 'react';
import api from '../api';

export default function ReporteGeneral() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading]   = useState(true);

  useEffect(() => { api.get('/clientes').then(r => { setClientes(r.data); setLoading(false); }); }, []);

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.identificacion.includes(busqueda) ||
    c.celular.includes(busqueda)
  );

  return (
    <div>
      <div className="page-header" style={{background:'#f7f8fa',borderRadius:'10px',padding:'22px 28px 18px',marginBottom:'28px',boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:4,letterSpacing:'-1px'}}>📋 Reporte General de Clientes</h1>
          <p style={{fontSize:'1.08rem',color:'var(--muted)',fontWeight:500}}>Listado completo con todos los datos personales</p>
        </div>
        <button className="btn btn-secondary" style={{alignSelf:'center'}} onClick={()=>window.print()}>🖨️ Imprimir</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input placeholder="🔍 Buscar por nombre, identificación o celular…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <span style={{color:'var(--muted)',fontSize:'.82rem',whiteSpace:'nowrap'}}>{filtrados.length} cliente(s)</span>
        </div>

        {loading ? <div className="loading">Cargando…</div>
         : filtrados.length === 0 ? <div className="empty"><p>No se encontraron clientes.</p></div>
         : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th><th>Nombre Completo</th><th>Identificación</th>
                <th>Celular</th><th>Fecha Inscripción</th><th>Género</th>
                <th>Días Restantes</th><th>Estado</th>
              </tr></thead>
              <tbody>
                {filtrados.map((c,i) => {
                  const dias = parseInt(c.dias_restantes);
                  return (
                    <tr key={c.id}>
                      <td style={{color:'var(--muted)'}}>{i+1}</td>
                      <td><strong>{c.nombre}</strong></td>
                      <td>{c.identificacion}</td>
                      <td>{c.celular}</td>
                      <td>{new Date(c.fecha_inscripcion).toLocaleDateString('es-CO')}</td>
                      <td><span className="badge badge-blue">{c.genero}</span></td>
                      <td><span className={dias<=0?'dias-none':dias<=3?'dias-warn':'dias-ok'}>{dias}</span></td>
                      <td>{dias>0?<span className="badge badge-green">Activo</span>:<span className="badge badge-red">Sin días</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:4}}>
        Reporte generado el {new Date().toLocaleString('es-CO')} — GimnasioPro
      </div>
    </div>
  );
}
