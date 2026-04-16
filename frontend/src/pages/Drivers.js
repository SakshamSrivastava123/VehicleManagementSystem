import { useEffect, useState } from 'react';
import { driverAPI } from '../utils/api';
import { toast } from 'react-toastify';

const EMPTY = { name: '', email: '', phone: '', licenseNumber: '', licenseExpiry: '', status: 'available', address: '', dateOfBirth: '', notes: '' };

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await driverAPI.getAll({ search, status: filterStatus });
      setDrivers(data);
    } catch { toast.error('Failed to fetch drivers'); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [search, filterStatus]);

  const openAdd = () => { setForm(EMPTY); setEditing(null); setModal(true); };
  const openEdit = (d) => {
    setForm({ ...d, licenseExpiry: d.licenseExpiry?.slice(0, 10) || '', dateOfBirth: d.dateOfBirth?.slice(0, 10) || '' });
    setEditing(d._id); setModal(true);
  };

  const handleSave = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) await driverAPI.update(editing, form);
      else await driverAPI.create(form);
      toast.success(editing ? 'Driver updated!' : 'Driver added!');
      setModal(false); fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver?')) return;
    try { await driverAPI.delete(id); toast.success('Deleted'); fetchAll(); }
    catch { toast.error('Failed to delete'); }
  };

  const isExpiringSoon = (date) => {
    if (!date) return false;
    const days = (new Date(date) - new Date()) / (1000 * 60 * 60 * 24);
    return days < 30 && days > 0;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Drivers</h1>
          <p className="page-subtitle">{drivers.length} drivers registered</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Driver</button>
      </div>

      <div className="filter-bar">
        <input className="search-input" placeholder="Search by name, license, phone..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {['available','on-trip','off-duty','inactive'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="empty-state"><p>Loading...</p></div> : drivers.length === 0 ? (
          <div className="empty-state"><div className="icon">👤</div><p>No drivers found</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead><tr>
                <th>Name</th><th>Contact</th><th>License</th><th>License Expiry</th><th>Total Trips</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {drivers.map(d => (
                  <tr key={d._id}>
                    <td><strong style={{ color: 'var(--text)' }}>{d.name}</strong></td>
                    <td><div>{d.phone}</div><div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{d.email}</div></td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{d.licenseNumber}</td>
                    <td>
                      <span style={{ color: isExpiringSoon(d.licenseExpiry) ? '#ffa500' : 'inherit' }}>
                        {d.licenseExpiry ? new Date(d.licenseExpiry).toLocaleDateString() : 'N/A'}
                        {isExpiringSoon(d.licenseExpiry) && ' ⚠️'}
                      </span>
                    </td>
                    <td>{d.totalTrips}</td>
                    <td><span className={`badge badge-${d.status?.replace(' ', '-')}`}>{d.status}</span></td>
                    <td><div className="actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(d)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(d._id)}>Del</button>
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
              <h2>{editing ? '✏️ Edit Driver' : '➕ Add Driver'}</h2>
              <button className="modal-close" onClick={() => setModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                <div className="form-grid">
                  {[['name','Name *','text','John Doe'],['email','Email *','email','john@example.com'],['phone','Phone *','tel','+91 9876543210'],['licenseNumber','License Number *','text','MH0120230001']].map(([field, label, type, ph]) => (
                    <div className="form-group" key={field}>
                      <label>{label}</label>
                      <input className="form-control" type={type} value={form[field]} onChange={e => setForm({...form, [field]: e.target.value})} placeholder={ph} required={label.includes('*')} />
                    </div>
                  ))}
                  <div className="form-group">
                    <label>License Expiry *</label>
                    <input className="form-control" type="date" value={form.licenseExpiry} onChange={e => setForm({...form, licenseExpiry: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input className="form-control" type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                      {['available','on-trip','off-duty','inactive'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Address</label>
                    <input className="form-control" value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="123 Main St, Mumbai" />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label>Notes</label>
                    <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update' : 'Add Driver'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
