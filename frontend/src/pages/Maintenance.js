import { useEffect, useState } from 'react';
import { maintenanceAPI, vehicleAPI } from '../utils/api';
import { toast } from 'react-toastify';

const EMPTY = { vehicle: '', type: 'oil-change', description: '', cost: '', serviceDate: '', nextServiceDate: '', mileageAtService: '', serviceProvider: '', status: 'scheduled', notes: '' };

export default function Maintenance() {
  const [records, setRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [r, v] = await Promise.all([maintenanceAPI.getAll({ status: filterStatus }), vehicleAPI.getAll()]);
      setRecords(r.data); setVehicles(v.data);
    } catch { toast.error('Failed to fetch'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [filterStatus]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (r) => {
    setForm({ ...r, vehicle: r.vehicle?._id || '', serviceDate: r.serviceDate?.slice(0,10) || '', nextServiceDate: r.nextServiceDate?.slice(0,10) || '' });
    setEditing(r._id); setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await maintenanceAPI.update(editing, form);
      else await maintenanceAPI.create(form);
      toast.success(editing ? 'Record updated!' : 'Maintenance logged!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete record?')) return;
    try { await maintenanceAPI.delete(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed'); }
  };

  const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">{records.length} records · Total cost: ₹{totalCost.toLocaleString()}</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Log Maintenance</button>
      </div>

      <div className="filter-bar">
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['scheduled','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><p>Loading...</p></div> : records.length === 0 ? (
          <div className="empty-state"><div className="icon">🔧</div><p>No maintenance records</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Vehicle</th><th>Type</th><th>Description</th><th>Service Date</th><th>Cost</th><th>Provider</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {records.map(r => (
                  <tr key={r._id}>
                    <td><strong style={{ color: 'var(--text)' }}>{r.vehicle?.registrationNumber || 'N/A'}</strong><br /><span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{r.vehicle?.make} {r.vehicle?.model}</span></td>
                    <td style={{ textTransform: 'capitalize' }}>{r.type?.replace('-', ' ')}</td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</td>
                    <td>{new Date(r.serviceDate).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--accent3)', fontWeight: 600 }}>₹{r.cost?.toLocaleString()}</td>
                    <td>{r.serviceProvider || '—'}</td>
                    <td><span className={`badge badge-${r.status?.replace(' ','-')}`}>{r.status}</span></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(r)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)}>Del</button>
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
              <h2>{editing ? '✏️ Edit Record' : '🔧 Log Maintenance'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Vehicle *</label>
                    <select className="form-control" value={form.vehicle} onChange={e => setForm({...form, vehicle: e.target.value})} required>
                      <option value="">Select vehicle...</option>
                      {vehicles.map(v => <option key={v._id} value={v._id}>{v.registrationNumber} — {v.make} {v.model}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Type</label>
                    <select className="form-control" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {['oil-change','tire-rotation','brake-service','engine-repair','general-service','other'].map(t => <option key={t} value={t}>{t.replace('-',' ')}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {['scheduled','in-progress','completed','cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Description *</label>
                    <input className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required placeholder="Describe the maintenance work..." />
                  </div>
                  <div className="form-group">
                    <label>Cost (₹) *</label>
                    <input className="form-control" type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Service Provider</label>
                    <input className="form-control" value={form.serviceProvider} onChange={e => setForm({...form, serviceProvider: e.target.value})} placeholder="AutoCare Garage" />
                  </div>
                  <div className="form-group">
                    <label>Service Date *</label>
                    <input className="form-control" type="date" value={form.serviceDate} onChange={e => setForm({...form, serviceDate: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Next Service Date</label>
                    <input className="form-control" type="date" value={form.nextServiceDate} onChange={e => setForm({...form, nextServiceDate: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Mileage at Service</label>
                    <input className="form-control" type="number" value={form.mileageAtService} onChange={e => setForm({...form, mileageAtService: e.target.value})} placeholder="54000" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Log'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
