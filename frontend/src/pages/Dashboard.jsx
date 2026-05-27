import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ clientes:0, adentro:0, activos:0, sinDias:0 });

  useEffect(() => {
    Promise.all([api.get('/clientes'), api.get('/asistencia/adentro')]).then(([c, a]) => {
      const sinDias = c.data.filter(x => parseInt(x.dias_restantes) <= 0).length;
      setStats({ clientes:c.data.length, adentro:a.data.length, activos:c.data.length-sinDias, sinDias });
    }).catch(() => {});
  }, []);

  const hoy = new Date().toLocaleDateString('es-CO',{ weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div>
      <div className="welcome-banner">
        <h2>Bienvenido a GimnasioPro 🏋️</h2>
        <p>{hoy.charAt(0).toUpperCase()+hoy.slice(1)}</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><h3>Total Clientes</h3><p>{stats.clientes}</p></div>
        <div className="stat-card green"><h3>En el gimnasio ahora</h3><p>{stats.adentro}</p></div>
        <div className="stat-card blue"><h3>Clientes activos</h3><p>{stats.activos}</p></div>
        <div className="stat-card orange"><h3>Sin días disponibles</h3><p>{stats.sinDias}</p></div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:14,fontSize:'1rem'}}>Accesos rápidos</h3>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <Link to="/clientes"   className="btn btn-primary">👥 Gestionar Clientes</Link>
          <Link to="/pagos"      className="btn btn-success">💳 Registrar Pago</Link>
          <Link to="/asistencia" className="btn btn-warning">🚪 Ingreso / Salida</Link>
          <Link to="/reporte-adentro" className="btn btn-secondary">🟢 Ver quién está dentro</Link>
        </div>
      </div>

      <div className="card">
        <h3 style={{marginBottom:12,fontSize:'1rem'}}>Tarifas vigentes</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Periodo</th><th>Días</th><th>Valor</th><th>Valor / día</th></tr></thead>
            <tbody>
              <tr><td>Por día</td><td>1 – 14</td><td>$8.000 por día</td><td>$8.000</td></tr>
              <tr><td>Quincenal</td><td>15</td><td>$50.000</td><td>$3.333</td></tr>
              <tr><td>Mensual</td><td>30</td><td>$90.000</td><td>$3.000</td></tr>
              <tr><td>Anual</td><td>365</td><td>$1.000.000</td><td>$2.740</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
