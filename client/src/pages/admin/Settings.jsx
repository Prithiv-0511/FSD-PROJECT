import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Building2, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { user, fetchUser } = useAuth();
  const [org, setOrg] = useState(null);
  const [form, setForm] = useState({ name: '', industry: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/org');
        setOrg(data.organization);
        setForm({ name: data.organization.name, industry: data.organization.industry || '' });
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.put('/org', form);
      toast.success('Settings updated');
      fetchUser();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner spinner-lg" /></div>;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      <div style={{ maxWidth: 600 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Building2 size={20} style={{ color: 'var(--primary-400)' }} /> Organization
          </h3>
          <form onSubmit={handleSave}>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Organization Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label className="form-label">Industry</label>
              <select className="select" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })}>
                <option value="">Select</option>
                <option value="technology">Technology</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">Organization Slug</label>
              <input className="input" value={org?.slug || ''} disabled style={{ opacity: 0.5 }} />
            </div>
            <button type="submit" className="btn btn-primary"><Save size={16} /> Save Changes</button>
          </form>
        </div>
      </div>
    </div>
  );
}
