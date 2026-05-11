import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Users, CheckCircle, Clock, AlertTriangle, Eye, TrendingUp, Plus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api/axios';

const COLORS = ['#6366f1', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, deptRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/departments'),
        ]);
        setStats({ ...dashRes.data, departmentStats: deptRes.data.departmentStats });
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /><p>Loading dashboard...</p></div>;
  if (!stats) return <div className="loading-screen"><p>Failed to load dashboard</p></div>;

  const { stats: s, recentAnnouncements, topViewed, departmentStats } = stats;

  const statCards = [
    { label: 'Total Announcements', value: s.totalAnnouncements, icon: Megaphone, color: 'purple' },
    { label: 'Active', value: s.activeAnnouncements, icon: CheckCircle, color: 'green' },
    { label: 'Expired', value: s.expiredAnnouncements, icon: AlertTriangle, color: 'red' },
    { label: 'Scheduled', value: s.scheduledAnnouncements, icon: Clock, color: 'amber' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <Link to="/admin/announcements/create" className="btn btn-primary" id="create-announcement-btn">
          <Plus size={18} /> New Announcement
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {statCards.map((card, i) => (
          <div key={i} className="glass-card stat-card">
            <div className={`stat-icon ${card.color}`}><card.icon size={24} /></div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        {/* Top Viewed Bar Chart */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={18} style={{ color: 'var(--primary-400)' }} /> Top Viewed Announcements
          </h3>
          {topViewed && topViewed.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topViewed.map(t => ({ name: t.title?.substring(0, 20) + '...', views: t.viewCount }))}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, color: '#f1f5f9' }}
                />
                <Bar dataKey="views" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </div>

        {/* Department Pie Chart */}
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={18} style={{ color: 'var(--success-400)' }} /> Announcements by Department
          </h3>
          {departmentStats && departmentStats.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ResponsiveContainer width="60%" height={260}>
                <PieChart>
                  <Pie data={departmentStats} dataKey="count" nameKey="departmentName" cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                    {departmentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {departmentStats.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.82rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.departmentName}</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Announcements */}
      <div className="glass-card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Megaphone size={18} style={{ color: 'var(--accent-400)' }} /> Recent Announcements
          </h3>
          <Link to="/admin/announcements" className="btn btn-ghost btn-sm">View All</Link>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Status</th><th>Priority</th><th>Views</th><th>Author</th></tr>
            </thead>
            <tbody>
              {recentAnnouncements?.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 600, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Link to={`/admin/announcements/${a._id}/edit`} style={{ color: 'inherit' }}>{a.title}</Link>
                  </td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td><span className={`badge badge-${a.priority}`}>{a.priority}</span></td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={14} /> {a.viewCount}</td>
                  <td>{a.authorId?.firstName} {a.authorId?.lastName}</td>
                </tr>
              ))}
              {(!recentAnnouncements || recentAnnouncements.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No announcements yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
