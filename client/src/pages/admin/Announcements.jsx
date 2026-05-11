import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, Send, Megaphone, CheckCircle } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import EnrollmentStatusModal from './EnrollmentStatusModal';

export default function Announcements() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ status: '', priority: '', search: '', page: 1 });
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.priority) params.set('priority', filters.priority);
      if (filters.search) params.set('search', filters.search);
      params.set('page', filters.page);
      params.set('limit', 15);

      const { data } = await api.get(`/announcements?${params}`);
      setAnnouncements(data.announcements);
      setPagination(data.pagination);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchAnnouncements(); }, [filters.status, filters.priority, filters.page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(f => ({ ...f, page: 1 }));
    fetchAnnouncements();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this announcement?')) return;
    try {
      await api.delete(`/announcements/${id}`);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch { toast.error('Delete failed'); }
  };

  const handlePublish = async (id) => {
    try {
      await api.post(`/announcements/${id}/publish`);
      toast.success('Announcement published!');
      fetchAnnouncements();
    } catch (err) { toast.error(err.response?.data?.message || 'Publish failed'); }
  };

  const statuses = ['', 'active', 'draft', 'scheduled', 'expired'];
  const priorities = ['', 'urgent', 'normal', 'low'];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Announcements</h1>
        <Link to="/admin/announcements/create" className="btn btn-primary" id="new-announcement-btn">
          <Plus size={18} /> Create Announcement
        </Link>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <form onSubmit={handleSearch} className="search-wrapper">
          <Search size={18} />
          <input className="input" placeholder="Search announcements..." value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} id="search-announcements" />
        </form>
        <div className="filter-group">
          {statuses.map(s => (
            <button key={s || 'all'} className={`filter-chip ${filters.status === s ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, status: s, page: 1 }))}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Priority filter */}
      <div className="filter-group" style={{ marginBottom: 20 }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginRight: 8 }}>Priority:</span>
        {priorities.map(p => (
          <button key={p || 'all'} className={`filter-chip ${filters.priority === p ? 'active' : ''}`} onClick={() => setFilters(f => ({ ...f, priority: p, page: 1 }))}>
            {p || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="glass-card table-container">
          <table>
            <thead>
              <tr><th>Title</th><th>Status</th><th>Priority</th><th>Departments</th><th>Views</th><th>Expires</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {announcements.map(a => (
                <tr key={a._id}>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 600 }}>{a.title}</td>
                  <td><span className={`badge badge-${a.status}`}>{a.status}</span></td>
                  <td><span className={`badge badge-${a.priority}`}>{a.priority}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>
                    {a.departmentIds?.length > 0 ? a.departmentIds.map(d => d.name).join(', ') : 'All'}
                  </td>
                  <td><Eye size={14} style={{ marginRight: 4 }} />{a.viewCount}</td>
                  <td style={{ fontSize: '0.82rem' }}>{a.expiresAt ? format(new Date(a.expiresAt), 'MMM dd, yyyy') : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {a.status === 'draft' && (
                        <button className="btn btn-ghost btn-icon btn-sm" title="Publish" onClick={() => handlePublish(a._id)}>
                          <Send size={15} style={{ color: 'var(--success-400)' }} />
                        </button>
                      )}
                      {(a.requiresAcknowledgement || a.requiresCompletion) && (
                        <button className="btn btn-ghost btn-icon btn-sm" title="View Status" onClick={() => setSelectedAnnouncementId(a._id)}>
                          <CheckCircle size={15} style={{ color: 'var(--primary-400)' }} />
                        </button>
                      )}
                      <button className="btn btn-ghost btn-icon btn-sm" title="Edit" onClick={() => navigate(`/admin/announcements/${a._id}/edit`)}>
                        <Edit size={15} />
                      </button>
                      <button className="btn btn-ghost btn-icon btn-sm" title="Delete" onClick={() => handleDelete(a._id)}>
                        <Trash2 size={15} style={{ color: 'var(--danger-400)' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {announcements.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <Megaphone size={48} />
                      <h3>No announcements found</h3>
                      <p>Create your first announcement to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button disabled={filters.page <= 1} onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}>←</button>
          {Array.from({ length: pagination.pages }, (_, i) => (
            <button key={i + 1} className={filters.page === i + 1 ? 'active' : ''} onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}>{i + 1}</button>
          ))}
          <button disabled={filters.page >= pagination.pages} onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}>→</button>
        </div>
      )}

      {selectedAnnouncementId && (
        <EnrollmentStatusModal
          announcementId={selectedAnnouncementId}
          onClose={() => setSelectedAnnouncementId(null)}
        />
      )}
    </div>
  );
}
