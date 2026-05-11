import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, Eye, AlertTriangle, Megaphone, Filter } from 'lucide-react';
import api from '../../api/axios';
import { format, formatDistanceToNow } from 'date-fns';

const priorityConfig = {
  urgent: { emoji: '🔴', color: 'var(--danger-400)', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' },
  normal: { emoji: '🔵', color: 'var(--primary-400)', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
  low: { emoji: '🟢', color: 'var(--success-400)', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)' },
};

export default function Feed() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (priority) params.set('priority', priority);
      params.set('page', page);
      params.set('limit', 10);

      const { data } = await api.get(`/announcements?${params}`);
      setAnnouncements(data.announcements);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, [priority, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchAnnouncements();
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
      </div>

      {/* Search & Filters */}
      <div className="toolbar">
        <form onSubmit={handleSearch} className="search-wrapper">
          <Search size={18} />
          <input className="input" placeholder="Search announcements..." value={search} onChange={e => setSearch(e.target.value)} id="feed-search" />
        </form>
        <div className="filter-group">
          {['', 'urgent', 'normal', 'low'].map(p => (
            <button key={p || 'all'} className={`filter-chip ${priority === p ? 'active' : ''}`} onClick={() => { setPriority(p); setPage(1); }}>
              {p ? `${priorityConfig[p]?.emoji} ${p}` : '📋 All'}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements Feed */}
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : announcements.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <Megaphone size={56} />
            <h3>No announcements right now</h3>
            <p>Check back later for updates from your organization</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {announcements.map((a, i) => {
            const pConfig = priorityConfig[a.priority] || priorityConfig.normal;
            return (
              <Link
                key={a._id}
                to={`/announcements/${a._id}`}
                style={{ textDecoration: 'none', color: 'inherit', animationDelay: `${i * 0.05}s` }}
                className="animate-in"
              >
                <div className="glass-card" style={{
                  padding: 24,
                  borderLeft: `4px solid ${pConfig.color}`,
                  cursor: 'pointer',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span className={`badge badge-${a.priority}`}>{a.priority}</span>
                        {a.departmentIds?.map(d => (
                          <span key={d._id || d} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color || 'var(--primary-400)' }} />
                            {d.name}
                          </span>
                        ))}
                      </div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6, lineHeight: 1.4 }}>
                        {a.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {a.summary || a.content?.replace(/<[^>]+>/g, '').substring(0, 200)}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, borderTop: '1px solid var(--border-primary)', paddingTop: 12 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      By {a.authorId?.firstName} {a.authorId?.lastName}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} /> {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Eye size={13} /> {a.viewCount} views
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
                      <AlertTriangle size={13} /> Expires {format(new Date(a.expiresAt), 'MMM dd, yyyy')}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>←</button>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)}>→</button>
        </div>
      )}
    </div>
  );
}
