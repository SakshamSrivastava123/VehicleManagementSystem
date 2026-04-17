import { useEffect, useState } from 'react';
import { vehicleAPI, driverAPI } from '../utils/api';
import { toast } from 'react-toastify';

const EMPTY = { registrationNumber: '', make: '', model: '', year: new Date().getFullYear(), type: 'car', fuelType: 'petrol', status: 'active', color: '', mileage: 0, assignedDriver: '', insuranceExpiry: '', notes: '' };

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [v, d] = await Promise.all([vehicleAPI.getAll({ search, status: filterStatus, type: filterType }), driverAPI.getAll()]);
      setVehicles(v.data);
      setDrivers(d.data);
    } catch { toast.error('Failed to fetch vehicles'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [search, filterStatus, filterType]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (v) => {
    setForm({ ...v, assignedDriver: v.assignedDriver?._id || '', insuranceExpiry: v.insuranceExpiry ? v.insuranceExpiry.slice(0, 10) : '' });
    setEditing(v._id);
    setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, assignedDriver: form.assignedDriver || null };
      if (editing) await vehicleAPI.update(editing, payload);
      else await vehicleAPI.create(payload);
      toast.success(editing ? 'Vehicle updated!' : 'Vehicle added!');
      setModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving vehicle'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try { await vehicleAPI.delete(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">{vehicles.length} vehicles in fleet</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Vehicle</button>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by reg, make, model..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['active','inactive','maintenance','retired'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Types</option>
          {['car','truck','van','bus','motorcycle','other'].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><p>Loading...</p></div> : vehicles.length === 0 ? (
          <div className="empty-state"><div className="icon">🚗</div><p>No vehicles found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Registration</th><th>Vehicle</th><th>Type</th><th>Fuel</th>
                <th>Mileage</th><th>Driver</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v._id}>
                    <td><strong style={{ color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{v.registrationNumber}</strong></td>
                    <td>{v.year} {v.make} {v.model}{v.color && <span style={{ color: 'var(--text3)', marginLeft: 6 }}>· {v.color}</span>}</td>
                    <td style={{ textTransform: 'capitalize' }}>{v.type}</td>
                    <td><span className={`badge badge-${v.fuelType}`}>{v.fuelType}</span></td>
                    <td>{v.mileage?.toLocaleString()} km</td>
                    <td>{v.assignedDriver?.name || <span style={{ color: 'var(--text3)' }}>Unassigned</span>}</td>
                    <td><span className={`badge badge-${v.status}`}>{v.status}</span></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(v)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>Del</button>
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
              <h2>{editing ? '✏️ Edit Vehicle' : '➕ Add Vehicle'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input className="form-control" value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} required placeholder="MH01AB1234" />
                  </div>
                  <div className="form-group">
                    <label>Year *</label>
                    <input className="form-control" type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Make *</label>
                    <input className="form-control" value={form.make} onChange={e => setForm({...form, make: e.target.value})} required placeholder="Toyota" />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input className="form-control" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required placeholder="Camry" />
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {['car','truck','van','bus','motorcycle','other'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Fuel Type</label>
                    <select className="form-control" value={form.fuelType} onChange={e => setForm({...form, fuelType: e.target.value})}>
                      {['petrol','diesel','electric','hybrid'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {['active','inactive','maintenance','retired'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input className="form-control" value={form.color} onChange={e => setForm({...form, color: e.target.value})} placeholder="White" />
                  </div>
                  <div className="form-group">
                    <label>Mileage (km)</label>
                    <input className="form-control" type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Insurance Expiry</label>
                    <input className="form-control" type="date" value={form.insuranceExpiry} onChange={e => setForm({...form, insuranceExpiry: e.target.value})} />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Assign Driver</label>
                    <select className="form-control" value={form.assignedDriver} onChange={e => setForm({...form, assignedDriver: e.target.value})}>
                      <option value="">— Unassigned —</option>
                      {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.licenseNumber})</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Notes</label>
                    <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Vehicle'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
