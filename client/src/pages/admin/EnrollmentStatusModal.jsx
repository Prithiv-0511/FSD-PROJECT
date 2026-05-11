import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../../api/axios';
import { formatDistanceToNow } from 'date-fns';

export default function EnrollmentStatusModal({ announcementId, onClose }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get(`/enrollments/${announcementId}`);
        setEnrollments(data.enrollments);
      } catch (err) {
        console.error('Failed to load enrollments');
      } finally {
        setLoading(false);
      }
    };
    if (announcementId) fetch();
  }, [announcementId]);

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" onClick={e => e.stopPropagation()} style={{ width: '90%', maxWidth: 700, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Enrollment Status</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}><X size={18} /></button>
        </div>

        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div className="loading-screen" style={{ minHeight: 200 }}><div className="spinner spinner-md" /></div>
          ) : enrollments.length === 0 ? (
            <div className="empty-state" style={{ padding: 40 }}>
              <p>No enrollment records found for this announcement.</p>
            </div>
          ) : (
            <div className="table-container">
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>Employee</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>Department</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>Status</th>
                    <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e._id} style={{ borderBottom: '1px solid var(--border-secondary)' }}>
                      <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--primary-500)', fontSize: '0.85rem' }}>
                          {e.userId?.firstName?.charAt(0)}{e.userId?.lastName?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{e.userId?.firstName} {e.userId?.lastName}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{e.userId?.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem' }}>
                        {e.userId?.departmentId ? e.userId?.departmentId.name : '—'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        {e.status === 'pending' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--danger-500)', fontSize: '0.85rem', fontWeight: 500 }}><AlertTriangle size={14}/> Pending</span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--success-500)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'capitalize' }}><CheckCircle size={14}/> {e.status}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(new Date(e.updatedAt), { addSuffix: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
