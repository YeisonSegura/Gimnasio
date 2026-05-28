import { NavLink } from 'react-router-dom';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🏋️ GimnasioPro</h2>
        <span>Sistema de Gestión</span>
      </div>
      <nav>
        {[
          { to:'/',                   icon:'📊', label:'Dashboard' },
          { to:'/clientes',           icon:'👥', label:'Clientes' },
          { to:'/pagos',              icon:'💳', label:'Pagos' },
          { to:'/asistencia',         icon:'🚪', label:'Ingresos / Salidas' },
          { to:'/historial',          icon:'📅', label:'Historial' },
          { to:'/reporte-general',    icon:'📋', label:'Reporte General' },
          { to:'/reporte-adentro',    icon:'🟢', label:'En el Gimnasio' },
        ].map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to==='/'} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <span className="nav-icon">{icon}</span> {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}