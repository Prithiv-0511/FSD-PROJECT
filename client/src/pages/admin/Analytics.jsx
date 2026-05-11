import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Eye, Users, Megaphone } from 'lucide-react';
import api from '../../api/axios';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [dashRes, deptRes] = await Promise.all([
          api.get('/analytics/dashboard'),
          api.get('/analytics/departments'),
        ]);
        setData({ ...dashRes.data, departmentStats: deptRes.data.departmentStats });
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;
  if (!data) return <div className="loading-screen"><p>Failed to load analytics</p></div>;

  const { stats, topViewed, departmentStats } = data;

  const overviewCards = [
    { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'purple' },
    { label: 'Active Users', value: stats.totalUsers, icon: Users, color: 'green' },
    { label: 'Active Announcements', value: stats.activeAnnouncements, icon: Megaphone, color: 'amber' },
    { label: 'Engagement Rate', value: stats.totalViews > 0 && stats.totalUsers > 0 ? `${Math.round((stats.totalViews / stats.totalUsers))}x` : '0x', icon: TrendingUp, color: 'red' },
  ];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {overviewCards.map((c, i) => (
          <div key={i} className="glass-card stat-card">
            <div className={`stat-icon ${c.color}`}><c.icon size={24} /></div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 28 }}>
        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 20 }}>📊 Top Viewed Announcements</h3>
          {topViewed?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topViewed.map(t => ({ name: t.title?.substring(0, 18) + (t.title?.length > 18 ? '...' : ''), views: t.viewCount }))}>
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, color: '#f1f5f9' }} />
                <Bar dataKey="views" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>

        <div className="glass-card" style={{ padding: 22 }}>
          <h3 style={{ marginBottom: 20 }}>🏢 By Department</h3>
          {departmentStats?.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height={300}>
                <PieChart>
                  <Pie data={departmentStats} dataKey="count" nameKey="departmentName" cx="50%" cy="50%" outerRadius={100} innerRadius={55}>
                    {departmentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(148,163,184,0.12)', borderRadius: 10, color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {departmentStats.map((d, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.85rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }} />
                    <span style={{ color: 'var(--text-secondary)' }}>{d.departmentName}</span>
                    <span style={{ fontWeight: 700, marginLeft: 'auto' }}>{d.count}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({d.totalViews} views)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>No data</div>}
        </div>
      </div>
    </div>
  );
}
