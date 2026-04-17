import { useEffect, useState } from 'react';
import { tripAPI, vehicleAPI, driverAPI } from '../utils/api';
import { toast } from 'react-toastify';

const EMPTY = { vehicle: '', driver: '', startLocation: '', endLocation: '', startTime: '', endTime: '', startMileage: '', endMileage: '', purpose: '', status: 'scheduled', fuelCost: 0, notes: '' };

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, v, d] = await Promise.all([tripAPI.getAll({ status: filterStatus }), vehicleAPI.getAll(), driverAPI.getAll()]);
      setTrips(t.data); setVehicles(v.data); setDrivers(d.data);
    } catch { toast.error('Failed to fetch'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterStatus]);

  const toDatetimeLocal = (iso) => iso ? iso.slice(0, 16) : '';

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (t) => {
    setForm({ ...t, vehicle: t.vehicle?._id || '', driver: t.driver?._id || '', startTime: toDatetimeLocal(t.startTime), endTime: toDatetimeLocal(t.endTime) });
    setEditing(t._id); setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await tripAPI.update(editing, form);
      else await tripAPI.create(form);
      toast.success(editing ? 'Trip updated!' : 'Trip created!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete trip?')) return;
    try { await tripAPI.delete(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const statusColor = { scheduled: '#6c63ff', 'in-progress': '#ffa500', completed: '#43e97b', cancelled: '#ff4757' };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Trips</h1>
          <p className="page-subtitle">{trips.length} trips recorded</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Create Trip</button>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['scheduled','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><p>Loading...</p></div> : trips.length === 0 ? (
          <div className="empty-state"><div className="icon">📍</div><p>No trips found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Route</th><th>Vehicle</th><th>Driver</th><th>Start Time</th><th>Distance</th><th>Fuel Cost</th><th>Purpose</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {trips.map(t => (
                  <tr key={t._id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.875rem' }}>
                        <span style={{ color:'var(--text)' }}>{t.startLocation}</span>
                        <span style={{ color: statusColor[t.status] || 'var(--accent)' }}>→</span>
                        <span style={{ color:'var(--text)' }}>{t.endLocation}</span>
                      </div>
                    </td>
                    <td>{t.vehicle?.registrationNumber || '—'}</td>
                    <td>{t.driver?.name || '—'}</td>
                    <td>{t.startTime ? new Date(t.startTime).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' }) : '—'}</td>
                    <td>{t.distance ? `${t.distance} km` : '—'}</td>
                    <td style={{ color:'var(--accent3)' }}>{t.fuelCost ? `₹${t.fuelCost}` : '—'}</td>
                    <td>{t.purpose || '—'}</td>
                    <td><span className={`badge badge-${t.status?.replace(' ','-')}`}>{t.status}</span></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(t)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(t._id)}>Del</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? '✏️ Edit Trip' : '📍 Create Trip'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Vehicle *</label>
                    <select className="form-control" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} required>
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Driver *</label>
                    <select className="form-control" value={form.driver} onChange={e => setForm({...form, driver: e.target.value})} required>
                      <option value="">Select driver...</option>
                      {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.licenseNumber})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Location *</label>
                    <input className="form-control" value={form.startLocation} onChange={e => setForm({...form, startLocation: e.target.value})} required placeholder="Mumbai" />
                  </div>
                  <div className="form-group">
                    <label>End Location *</label>
                    <input className="form-control" value={form.endLocation} onChange={e => setForm({...form, endLocation: e.target.value})} required placeholder="Pune" />
                  </div>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input className="form-control" type="datetime-local" value={form.startTime} onChange={e => setForm({...form, startTime: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input className="form-control" type="datetime-local" value={form.endTime} onChange={e => setForm({...form, endTime: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Start Mileage (km) *</label>
                    <input className="form-control" type="number" value={form.startMileage} onChange={e => setForm({...form, startMileage: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>End Mileage (km)</label>
                    <input className="form-control" type="number" value={form.endMileage} onChange={e => setForm({...form, endMileage: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {['scheduled','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fuel Cost (₹)</label>
                    <input className="form-control" type="number" value={form.fuelCost} onChange={e => setForm({...form, fuelCost: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Purpose</label>
                    <input className="form-control" value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} placeholder="Client delivery, airport pickup..." />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Create Trip'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
