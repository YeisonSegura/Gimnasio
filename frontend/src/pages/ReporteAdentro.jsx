import { useEffect, useState } from 'react';
import api from '../api';

export default function ReporteAdentro() {
  const [adentro, setAdentro] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ultima,  setUltima]  = useState('');

  const cargar = () => {
    api.get('/asistencia/adentro').then(r => {
      setAdentro(r.data);
      setLoading(false);
      setUltima(new Date().toLocaleTimeString('es-CO'));
    });
  };

  useEffect(() => {
    cargar();
    const t = setInterval(cargar, 30000); // auto-refresh cada 30s
    return () => clearInterval(t);
  }, []);

  const tiempo = (entrada) => {
    const min = Math.floor((Date.now() - new Date(entrada).getTime()) / 60000);
    return min < 60 ? `${min} min` : `${Math.floor(min/60)}h ${min%60}min`;
  };

  return (
    <div>
      <div className="page-header" style={{background:'#f7f8fa',borderRadius:'10px',padding:'22px 28px 18px',marginBottom:'28px',boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:4,letterSpacing:'-1px'}}>🟢 Clientes en el Gimnasio</h1>
          <p style={{fontSize:'1.08rem',color:'var(--muted)',fontWeight:500}}>Tiempo real — última actualización: {ultima} — refresca automáticamente cada 30s</p>
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span className="badge badge-green" style={{fontSize:'.95rem',padding:'7px 14px'}}>{adentro.length} dentro</span>
          <button className="btn btn-secondary" onClick={cargar}>🔄 Actualizar</button>
          <button className="btn btn-secondary" onClick={()=>window.print()}>🖨️ Imprimir</button>
        </div>
      </div>

      <div className="card">
        {loading ? <div className="loading">Cargando…</div>
         : adentro.length === 0
          ? <div className="empty">
              <div style={{fontSize:'2.5rem',marginBottom:8}}>🏃</div>
              <p>No hay clientes dentro del gimnasio en este momento.</p>
            </div>
          : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th><th>Nombre Completo</th><th>Identificación</th>
                <th>Celular</th><th>Género</th><th>Hora de Entrada</th>
                <th>Tiempo dentro</th><th>Días restantes</th>
              </tr></thead>
              <tbody>
                {adentro.map((a,i) => (
                  <tr key={a.asistencia_id}>
                    <td style={{color:'var(--muted)'}}>{i+1}</td>
                    <td><strong>{a.nombre}</strong></td>
                    <td>{a.identificacion}</td>
                    <td>{a.celular}</td>
                    <td><span className="badge badge-blue">{a.genero}</span></td>
                    <td>{new Date(a.entrada).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'})}</td>
                    <td><span className="badge badge-yellow">{tiempo(a.entrada)}</span></td>
                    <td><span className="dias-ok">{a.dias_restantes}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:4}}>
        Reporte en tiempo real — GimnasioPro — {new Date().toLocaleString('es-CO')}
      </div>
    </div>
  );
}
