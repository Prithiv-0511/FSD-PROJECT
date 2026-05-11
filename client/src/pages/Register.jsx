import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Mail, Lock, User, Building2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', organizationName: '', industry: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Organization created! Welcome to AnnounceHub.');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-logo">
          <div className="logo-icon"><Megaphone size={22} /></div>
          <h1>AnnounceHub</h1>
        </div>
        <p className="auth-subtitle">Create your organization workspace</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="input" placeholder="John" value={form.firstName} onChange={update('firstName')} required id="reg-fname" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="input" placeholder="Doe" value={form.lastName} onChange={update('lastName')} required id="reg-lname" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Organization Name</label>
            <div style={{ position: 'relative' }}>
              <Building2 size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" placeholder="Acme Corp" value={form.organizationName} onChange={update('organizationName')} style={{ paddingLeft: 40 }} required id="reg-org" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Industry</label>
            <select className="select" value={form.industry} onChange={update('industry')} id="reg-industry">
              <option value="">Select industry</option>
              <option value="technology">Technology</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type="email" placeholder="admin@company.com" value={form.email} onChange={update('email')} style={{ paddingLeft: 40 }} required id="reg-email" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input className="input" type={showPass ? 'text' : 'password'} placeholder="Min 6 characters" value={form.password} onChange={update('password')} style={{ paddingLeft: 40, paddingRight: 40 }} required minLength={6} id="reg-password" />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="btn btn-primary btn-lg" type="submit" disabled={loading} id="reg-submit" style={{ marginTop: 8 }}>
            {loading ? <span className="spinner" /> : 'Create Organization'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
