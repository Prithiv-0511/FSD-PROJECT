import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', color: '#6366f1' });

  const fetchDepartments = async () => {
    try { const { data } = await api.get('/org/departments'); setDepartments(data.departments); }
    catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const openCreate = () => { setEditId(null); setForm({ name: '', description: '', color: COLORS[departments.length % COLORS.length] }); setShowModal(true); };
  const openEdit = (d) => { setEditId(d._id); setForm({ name: d.name, description: d.description || '', color: d.color || '#6366f1' }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/org/departments/${editId}`, form);
        toast.success('Department updated');
      } else {
        await api.post('/org/departments', form);
        toast.success('Department created');
      }
      setShowModal(false);
      fetchDepartments();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this department?')) return;
    try { await api.delete(`/org/departments/${id}`); toast.success('Department deleted'); fetchDepartments(); }
    catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Departments</h1>
        <button className="btn btn-primary" onClick={openCreate} id="create-dept-btn"><Plus size={18} /> Add Department</button>
      </div>

      <div className="grid grid-3">
        {departments.map(d => (
          <div key={d._id} className="glass-card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: d.color }} />
                <h3 style={{ fontSize: '1.05rem' }}>{d.name}</h3>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(d)}><Edit size={15} /></button>
                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => handleDelete(d._id)}><Trash2 size={15} style={{ color: 'var(--danger-400)' }} /></button>
              </div>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {d.description || 'No description'}
            </p>
          </div>
        ))}
        {departments.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
            <div className="empty-state">
              <Building2 size={48} />
              <h3>No departments yet</h3>
              <p>Create departments to organize your announcements</p>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">{editId ? 'Edit Department' : 'Create Department'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Name</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Engineering" />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Description</label>
                <textarea className="textarea" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional description" rows={3} />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', transition: 'border var(--transition-fast)' }}
                    />
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
