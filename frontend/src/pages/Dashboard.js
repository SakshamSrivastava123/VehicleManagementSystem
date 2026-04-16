import { useEffect, useState } from 'react';
import { vehicleAPI, driverAPI, tripAPI, maintenanceAPI } from '../utils/api';
import './Dashboard.css';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="stat-card" style={{ '--c': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-body">
      <div className="stat-value">{value ?? '—'}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  </div>
);

export default function Dashboard() {
  const [vStats, setVStats] = useState(null);
  const [dStats, setDStats] = useState(null);
  const [tStats, setTStats] = useState(null);
  const [recentTrips, setRecentTrips] = useState([]);
  const [upcomingMaint, setUpcomingMaint] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      vehicleAPI.getStats(),
      driverAPI.getStats(),
      tripAPI.getStats(),
      tripAPI.getAll({ status: 'in-progress' }),
      maintenanceAPI.getAll({ status: 'scheduled' }),
    ]).then(([v, d, t, trips, maint]) => {
      setVStats(v.data);
      setDStats(d.data);
      setTStats(t.data);
      setRecentTrips(trips.data.slice(0, 5));
      setUpcomingMaint(maint.data.slice(0, 5));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Fleet overview at a glance</p>
        </div>
        <div className="date-badge">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Vehicles" value={vStats?.total} icon="🚗" color="#6c63ff" sub={`${vStats?.active} active`} />
        <StatCard label="In Maintenance" value={vStats?.maintenance} icon="🔧" color="#ffa500" sub={`${vStats?.inactive} inactive`} />
        <StatCard label="Total Drivers" value={dStats?.total} icon="👥" color="#43e97b" sub={`${dStats?.available} available`} />
        <StatCard label="Drivers On Trip" value={dStats?.onTrip} icon="📍" color="#ff6584" sub={`${dStats?.offDuty} off-duty`} />
        <StatCard label="Total Trips" value={tStats?.total} icon="🗺️" color="#4ecdc4" sub={`${tStats?.completed} completed`} />
        <StatCard label="Total Distance" value={tStats?.totalDistance ? `${tStats.totalDistance.toLocaleString()} km` : '0 km'} icon="📏" color="#f5a623" sub={`₹${(tStats?.totalFuelCost || 0).toLocaleString()} fuel cost`} />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h3>🚗 Active Trips</h3>
            <span className="count-badge">{recentTrips.length}</span>
          </div>
          {recentTrips.length === 0 ? (
            <div className="empty-state"><div className="icon">🗺️</div><p>No active trips</p></div>
          ) : (
            <div className="trip-list">
              {recentTrips.map(t => (
                <div key={t._id} className="trip-item">
                  <div className="trip-route">
                    <span className="from">{t.startLocation}</span>
                    <span className="arrow">→</span>
                    <span className="to">{t.endLocation}</span>
                  </div>
                  <div className="trip-meta">
                    <span>{t.vehicle?.registrationNumber || 'N/A'}</span>
                    <span>•</span>
                    <span>{t.driver?.name || 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>🔧 Scheduled Maintenance</h3>
            <span className="count-badge">{upcomingMaint.length}</span>
          </div>
          {upcomingMaint.length === 0 ? (
            <div className="empty-state"><div className="icon">✅</div><p>No scheduled maintenance</p></div>
          ) : (
            <div className="maint-list">
              {upcomingMaint.map(m => (
                <div key={m._id} className="maint-item">
                  <div className="maint-info">
                    <span className="maint-type">{m.type.replace('-', ' ')}</span>
                    <span className="maint-vehicle">{m.vehicle?.registrationNumber || 'N/A'}</span>
                  </div>
                  <div className="maint-cost">₹{m.cost?.toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
