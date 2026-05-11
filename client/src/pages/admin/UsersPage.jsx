import { useState, useEffect } from 'react';
import { UserPlus, Search, Shield, Trash2, Users as UsersIcon } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState('');
  const [inviteForm, setInviteForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'employee', departmentId: '' });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = search ? `?search=${search}` : '';
      const { data } = await api.get(`/users${params}`);
      setUsers(data.users);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchUsers();
    api.get('/org/departments').then(({ data }) => setDepartments(data.departments)).catch(() => {});
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users/invite', inviteForm);
      toast.success('User invited successfully!');
      setShowInvite(false);
      setInviteForm({ firstName: '', lastName: '', email: '', password: '', role: 'employee', departmentId: '' });
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to invite user'); }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch { toast.error('Failed to update role'); }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Deactivate this user?')) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Team Members</h1>
        <button className="btn btn-primary" onClick={() => setShowInvite(true)} id="invite-user-btn">
          <UserPlus size={18} /> Invite User
        </button>
      </div>

      <div className="toolbar">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="search-wrapper">
          <Search size={18} />
          <input className="input" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </form>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner spinner-lg" /></div>
      ) : (
        <div className="glass-card table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>
                        {u.firstName?.[0]}{u.lastName?.[0]}
                      </div>
                      <span style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select className="select" value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} style={{ width: 'auto', padding: '4px 30px 4px 10px', fontSize: '0.8rem' }}>
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    {u.departmentId ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: u.departmentId.color || 'var(--primary-400)' }} />
                        {u.departmentId.name}
                      </span>
                    ) : '—'}
                  </td>
                  <td><span className={`badge ${u.isActive ? 'badge-active' : 'badge-expired'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{ fontSize: '0.82rem' }}>{format(new Date(u.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    <button className="btn btn-ghost btn-icon btn-sm" title="Deactivate" onClick={() => handleDeactivate(u._id)}>
                      <Trash2 size={15} style={{ color: 'var(--danger-400)' }} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7}><div className="empty-state"><UsersIcon size={48} /><h3>No team members</h3><p>Invite people to join your organization</p></div></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowInvite(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Invite Team Member</h3>
              <button className="modal-close" onClick={() => setShowInvite(false)}>✕</button>
            </div>
            <form onSubmit={handleInvite}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="input" value={inviteForm.firstName} onChange={e => setInviteForm({ ...inviteForm, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="input" value={inviteForm.lastName} onChange={e => setInviteForm({ ...inviteForm, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Email</label>
                <input className="input" type="email" value={inviteForm.email} onChange={e => setInviteForm({ ...inviteForm, email: e.target.value })} required />
              </div>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Password</label>
                <input className="input" type="password" value={inviteForm.password} onChange={e => setInviteForm({ ...inviteForm, password: e.target.value })} required minLength={6} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Role</label>
                  <select className="select" value={inviteForm.role} onChange={e => setInviteForm({ ...inviteForm, role: e.target.value })}>
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="select" value={inviteForm.departmentId} onChange={e => setInviteForm({ ...inviteForm, departmentId: e.target.value })}>
                    <option value="">None</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><UserPlus size={16} /> Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
