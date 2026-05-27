import { useEffect, useState } from 'react';
import api from '../api';

const VACIO = { nombre:'', identificacion:'', celular:'', fecha_inscripcion: new Date().toISOString().split('T')[0], genero:'Masculino' };

function diasClass(d) {
  const n = parseInt(d);
  if (n <= 0) return 'dias-none';
  if (n <= 3) return 'dias-warn';
  return 'dias-ok';
}

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(VACIO);
  const [editId, setEditId]     = useState(null);
  const [msg, setMsg]           = useState(null);
  const [loading, setLoading]   = useState(true);

  const cargar = () => {
    setLoading(true);
    api.get('/clientes').then(r => { setClientes(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(cargar, []);

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.identificacion.includes(busqueda) ||
    c.celular.includes(busqueda)
  );

  const abrirCrear  = () => { setForm(VACIO); setEditId(null); setMsg(null); setModal(true); };
  const abrirEditar = (c) => {
    setForm({ nombre:c.nombre, identificacion:c.identificacion, celular:c.celular,
      fecha_inscripcion: c.fecha_inscripcion?.split('T')[0] || c.fecha_inscripcion, genero:c.genero });
    setEditId(c.id); setMsg(null); setModal(true);
  };
  const cerrar = () => { setModal(false); setMsg(null); };

  const guardar = async () => {
    if (!form.nombre || !form.identificacion || !form.celular || !form.genero)
      return setMsg({ tipo:'error', texto:'Completa todos los campos obligatorios' });
    try {
      if (editId) await api.put(`/clientes/${editId}`, form);
      else        await api.post('/clientes', form);
      cargar(); cerrar();
    } catch (e) {
      setMsg({ tipo:'error', texto: e.response?.data?.error || 'Error al guardar' });
    }
  };

  const eliminar = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar al cliente "${nombre}"? Esta acción no se puede deshacer.`)) return;
    try { await api.delete(`/clientes/${id}`); cargar(); }
    catch (e) { alert(e.response?.data?.error || 'Error al eliminar'); }
  };

  return (
    <div>

      <div className="page-header" style={{background:'#f7f8fa',borderRadius:'10px',padding:'22px 28px 18px',marginBottom:'28px',boxShadow:'0 1px 8px rgba(0,0,0,.04)'}}>
        <div>
          <h1 style={{fontSize:'2rem',fontWeight:800,marginBottom:4,letterSpacing:'-1px'}}>Gestión de Clientes</h1>
          <p style={{fontSize:'1.08rem',color:'var(--muted)',fontWeight:500}}>Registro, modificación y eliminación de clientes</p>
        </div>
        <button className="btn btn-primary" style={{height:40,alignSelf:'center'}} onClick={abrirCrear}>+ Nuevo cliente</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input placeholder="🔍 Buscar por nombre, identificación o celular…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} />
          <span style={{color:'var(--muted)',fontSize:'.82rem',whiteSpace:'nowrap'}}>{filtrados.length} cliente(s)</span>
        </div>
        {loading ? <div className="loading">Cargando clientes…</div>
         : filtrados.length === 0 ? <div className="empty"><p>No se encontraron clientes.</p></div>
         : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>#</th><th>Nombre completo</th><th>Identificación</th>
                <th>Celular</th><th>Inscripción</th><th>Género</th>
                <th>Días rest.</th><th>Estado</th><th>Acciones</th>
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
                      <td><span className={diasClass(c.dias_restantes)}>{dias}</span></td>
                      <td>{dias > 0 ? <span className="badge badge-green">Activo</span> : <span className="badge badge-red">Sin días</span>}</td>
                      <td>
                        <button className="btn btn-warning btn-sm" style={{marginRight:5}} onClick={()=>abrirEditar(c)}>✏️</button>
                        <button className="btn btn-danger  btn-sm" onClick={()=>eliminar(c.id,c.nombre)}>🗑️</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={cerrar}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button className="modal-close" onClick={cerrar}>✕</button>
            </div>
            {msg && <div className={`alert alert-${msg.tipo}`}>{msg.texto}</div>}
            <div className="form-grid">
              <div className="form-group full">
                <label>Nombre completo *</label>
                <input value={form.nombre} onChange={e=>setForm({...form,nombre:e.target.value})} placeholder="Ej: Juan Carlos Pérez González" />
              </div>
              <div className="form-group">
                <label>Identificación *</label>
                <input value={form.identificacion} onChange={e=>setForm({...form,identificacion:e.target.value})} placeholder="Ej: 1098765432" />
              </div>
              <div className="form-group">
                <label>Celular *</label>
                <input value={form.celular} onChange={e=>setForm({...form,celular:e.target.value})} placeholder="Ej: 3001234567" />
              </div>
              <div className="form-group">
                <label>Fecha de inscripción</label>
                <input type="date" value={form.fecha_inscripcion} onChange={e=>setForm({...form,fecha_inscripcion:e.target.value})} />
              </div>
              <div className="form-group">
                <label>Género *</label>
                <select value={form.genero} onChange={e=>setForm({...form,genero:e.target.value})}>
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={cerrar}>Cancelar</button>
              <button className="btn btn-primary" onClick={guardar}>{editId ? 'Guardar cambios' : 'Crear cliente'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
