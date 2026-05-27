import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar        from './components/Sidebar.jsx'
import Dashboard      from './pages/Dashboard.jsx'
import Clientes       from './pages/Clientes.jsx'
import Pagos          from './pages/Pagos.jsx'
import Asistencia     from './pages/Asistencia.jsx'
import ReporteGeneral from './pages/ReporteGeneral.jsx'
import ReporteAdentro from './pages/ReporteAdentro.jsx'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/"                element={<Dashboard />} />
            <Route path="/clientes"        element={<Clientes />} />
            <Route path="/pagos"           element={<Pagos />} />
            <Route path="/asistencia"      element={<Asistencia />} />
            <Route path="/reporte-general" element={<ReporteGeneral />} />
            <Route path="/reporte-adentro" element={<ReporteAdentro />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
