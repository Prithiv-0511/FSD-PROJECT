import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Eye, Calendar, User, AlertTriangle, CheckCircle, CheckSquare } from 'lucide-react';
import api from '../../api/axios';
import { format, formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/announcements/${id}`);
        setAnnouncement(data.announcement);
        
        if (data.announcement.requiresAcknowledgement || data.announcement.requiresCompletion) {
          try {
            const { data: eData } = await api.get(`/enrollments/${id}/me`);
            setEnrollment(eData.enrollment);
          } catch {}
        }
      } catch {
        navigate('/feed');
      } finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleUpdateStatus = async (status) => {
    setUpdating(true);
    try {
      const { data } = await api.post(`/enrollments/${id}`, { status });
      setEnrollment(data.enrollment);
      toast.success(`Marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;
  if (!announcement) return null;

  const a = announcement;

  return (
    <div className="animate-in">
      <button className="btn btn-ghost" onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>
        <ArrowLeft size={18} /> Back to Feed
      </button>

      <div className="glass-card" style={{ padding: 32, maxWidth: 900 }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <span className={`badge badge-${a.priority}`}>{a.priority}</span>
            <span className={`badge badge-${a.status}`}>{a.status}</span>
            {a.departmentIds?.map(d => (
              <span key={d._id || d} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: d.color || 'var(--primary-400)' }} />
                {d.name}
              </span>
            ))}
          </div>

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1.3, marginBottom: 16 }}>
            {a.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: '0.85rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={15} /> {a.authorId?.firstName} {a.authorId?.lastName}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={15} /> {format(new Date(a.createdAt), 'MMM dd, yyyy · h:mm a')}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={15} /> {a.viewCount} views
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={15} /> Expires {format(new Date(a.expiresAt), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>

        {/* Summary */}
        {a.summary && (
          <div style={{
            padding: 16, background: 'rgba(99,102,241,0.06)',
            borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.12)',
            marginBottom: 24, fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--primary-400)' }}>Summary: </strong>{a.summary}
          </div>
        )}

        {/* Enrollment Status */}
        {enrollment && (
          <div style={{
            padding: 20, background: enrollment.status === 'pending' ? 'rgba(239,68,68,0.06)' : 'rgba(34,197,94,0.06)',
            borderRadius: 'var(--radius-md)', border: enrollment.status === 'pending' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(34,197,94,0.2)',
            marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {enrollment.status === 'pending' ? <AlertTriangle style={{ color: 'var(--danger-500)' }} /> : <CheckCircle style={{ color: 'var(--success-500)' }} />}
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {a.requiresAcknowledgement && 'Acknowledgement Required'}
                  {!a.requiresAcknowledgement && a.requiresCompletion && 'Completion Required'}
                </h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4 }}>
                  Status: <strong style={{ textTransform: 'capitalize', color: enrollment.status === 'pending' ? 'var(--danger-500)' : 'var(--success-500)' }}>{enrollment.status}</strong>
                </p>
              </div>
            </div>
            {enrollment.status === 'pending' && (
              <div style={{ display: 'flex', gap: 10 }}>
                {a.requiresAcknowledgement && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus('acknowledged')} disabled={updating}>
                    <CheckCircle size={16} /> {updating ? 'Saving...' : 'Mark as Acknowledged'}
                  </button>
                )}
                {a.requiresCompletion && !a.requiresAcknowledgement && (
                  <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus('completed')} disabled={updating}>
                    <CheckSquare size={16} /> {updating ? 'Saving...' : 'Mark as Completed'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div
          style={{
            fontSize: '1rem', lineHeight: 1.8, color: 'var(--text-secondary)',
          }}
          className="announcement-content"
          dangerouslySetInnerHTML={{ __html: a.content }}
        />
      </div>

      <style>{`
        .announcement-content h1, .announcement-content h2, .announcement-content h3 { color: var(--text-primary); margin: 20px 0 10px; }
        .announcement-content p { margin-bottom: 12px; }
        .announcement-content ul, .announcement-content ol { padding-left: 24px; margin-bottom: 12px; }
        .announcement-content a { color: var(--primary-400); text-decoration: underline; }
        .announcement-content blockquote { border-left: 3px solid var(--primary-500); padding-left: 16px; margin: 16px 0; color: var(--text-muted); }
        .announcement-content img { max-width: 100%; border-radius: var(--radius-md); margin: 12px 0; }
        .announcement-content pre { background: var(--bg-tertiary); padding: 16px; border-radius: var(--radius-md); overflow-x: auto; }
        .announcement-content code { background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
      `}</style>
    </div>
  );
}
