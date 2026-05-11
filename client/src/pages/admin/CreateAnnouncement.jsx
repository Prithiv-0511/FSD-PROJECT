import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ArrowLeft, Sparkles, Send, Save } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ color: [] }, { background: [] }],
    ['link', 'image'],
    ['blockquote', 'code-block'],
    ['clean'],
  ],
};

export default function CreateAnnouncement() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    title: '', content: '', summary: '', priority: 'normal',
    departmentIds: [], publishAt: '', expiresAt: '', category: 'general',
    requiresAcknowledgement: false, requiresCompletion: false,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState('');

  useEffect(() => {
    const fetchDepts = async () => {
      try { const { data } = await api.get('/org/departments'); setDepartments(data.departments); } catch { }
    };
    fetchDepts();

    if (isEdit) {
      const fetchAnnouncement = async () => {
        try {
          const { data } = await api.get(`/announcements/${id}`);
          const a = data.announcement;
          setForm({
            title: a.title, content: a.content, summary: a.summary || '',
            priority: a.priority, departmentIds: a.departmentIds?.map(d => d._id || d) || [],
            publishAt: a.publishAt ? new Date(a.publishAt).toISOString().slice(0, 16) : '',
            expiresAt: a.expiresAt ? new Date(a.expiresAt).toISOString().slice(0, 16) : '',
            category: a.category || 'general',
            requiresAcknowledgement: a.requiresAcknowledgement || false,
            requiresCompletion: a.requiresCompletion || false,
          });
        } catch { toast.error('Failed to load announcement'); navigate('/admin/announcements'); }
      };
      fetchAnnouncement();
    }
  }, [id]);

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleDeptToggle = (deptId) => {
    setForm(f => ({
      ...f,
      departmentIds: f.departmentIds.includes(deptId)
        ? f.departmentIds.filter(d => d !== deptId)
        : [...f.departmentIds, deptId],
    }));
  };

  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.publishAt) {
        const d = new Date(payload.publishAt);
        if (!isNaN(d)) payload.publishAt = d.toISOString();
      }
      if (payload.expiresAt) {
        const d = new Date(payload.expiresAt);
        if (!isNaN(d)) payload.expiresAt = d.toISOString();
      }

      let announcementId;
      if (isEdit) {
        await api.put(`/announcements/${id}`, payload);
        announcementId = id;
        toast.success('Announcement updated!');
      } else {
        const { data } = await api.post('/announcements', payload);
        announcementId = data.announcement._id;
        toast.success('Announcement created!');
      }

      if (publish) {
        await api.post(`/announcements/${announcementId}/publish`);
        toast.success('Announcement published!');
      }

      navigate('/admin/announcements');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  // AI Features
  const aiSummarize = async () => {
    if (!form.content) { toast.error('Write some content first'); return; }
    setAiLoading('summarize');
    try {
      const { data } = await api.post('/ai/summarize', { content: form.content });
      setForm(f => ({ ...f, summary: data.summary }));
      toast.success('Summary generated!');
    } catch (err) { toast.error(err.response?.data?.message || 'AI unavailable'); }
    finally { setAiLoading(''); }
  };

  const aiSuggestTitle = async () => {
    if (!form.content) { toast.error('Write some content first'); return; }
    setAiLoading('title');
    try {
      const { data } = await api.post('/ai/suggest-title', { content: form.content, currentTitle: form.title });
      if (data.suggestions?.[0]) {
        setForm(f => ({ ...f, title: data.suggestions[0] }));
        toast.success('Title suggested! ' + (data.suggestions.length > 1 ? `(${data.suggestions.length} options)` : ''));
      }
    } catch (err) { toast.error(err.response?.data?.message || 'AI unavailable'); }
    finally { setAiLoading(''); }
  };

  const aiCategorize = async () => {
    if (!form.content) { toast.error('Write some content first'); return; }
    setAiLoading('categorize');
    try {
      const { data } = await api.post('/ai/categorize', { content: form.content, title: form.title });
      setForm(f => ({ ...f, category: data.category }));
      toast.success(`Categorized as: ${data.category}`);
    } catch (err) { toast.error(err.response?.data?.message || 'AI unavailable'); }
    finally { setAiLoading(''); }
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/admin/announcements')}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title">{isEdit ? 'Edit Announcement' : 'Create Announcement'}</h1>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} noValidate>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24, alignItems: 'start' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="glass-card" style={{ padding: 24 }}>
              <div className="form-group" style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Title</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={aiSuggestTitle} disabled={!!aiLoading}>
                    <Sparkles size={14} /> {aiLoading === 'title' ? 'Suggesting...' : 'AI Suggest'}
                  </button>
                </div>
                <input className="input" placeholder="Announcement title" value={form.title} onChange={update('title')} required id="announcement-title" />
              </div>

              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">Content</label>
                <ReactQuill
                  theme="snow"
                  value={form.content}
                  onChange={(val) => setForm(f => ({ ...f, content: val }))}
                  modules={quillModules}
                  placeholder="Write your announcement content..."
                />
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Summary</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={aiSummarize} disabled={!!aiLoading}>
                    <Sparkles size={14} /> {aiLoading === 'summarize' ? 'Generating...' : 'AI Summarize'}
                  </button>
                </div>
                <textarea className="textarea" placeholder="Brief summary for notifications..." value={form.summary} onChange={update('summary')} rows={3} />
              </div>
            </div>
          </div>

          {/* Sidebar Settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ marginBottom: 16, fontSize: '0.95rem' }}>Settings</h4>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Priority</label>
                <select className="select" value={form.priority} onChange={update('priority')}>
                  <option value="low">🟢 Low</option>
                  <option value="normal">🔵 Normal</option>
                  <option value="urgent">🔴 Urgent</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label className="form-label">Category</label>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={aiCategorize} disabled={!!aiLoading} style={{ fontSize: '0.72rem', padding: '3px 8px' }}>
                    <Sparkles size={12} /> {aiLoading === 'categorize' ? '...' : 'Auto'}
                  </button>
                </div>
                <select className="select" value={form.category} onChange={update('category')}>
                  <option value="general">General</option>
                  <option value="hr">HR</option>
                  <option value="engineering">Engineering</option>
                  <option value="finance">Finance</option>
                  <option value="marketing">Marketing</option>
                  <option value="operations">Operations</option>
                  <option value="safety">Safety</option>
                  <option value="events">Events</option>
                  <option value="policy">Policy</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Schedule Publish</label>
                <input className="input" type="datetime-local" value={form.publishAt} onChange={update('publishAt')} />
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Expiry Date *</label>
                <input className="input" type="datetime-local" value={form.expiresAt} onChange={update('expiresAt')} />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.requiresAcknowledgement} onChange={(e) => setForm({ ...form, requiresAcknowledgement: e.target.checked })} />
                  <span style={{ fontSize: '0.85rem' }}>Require Acknowledgement</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.requiresCompletion} onChange={(e) => setForm({ ...form, requiresCompletion: e.target.checked })} />
                  <span style={{ fontSize: '0.85rem' }}>Require Completion</span>
                </label>
              </div>
            </div>

            <div className="glass-card" style={{ padding: 20 }}>
              <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>Target Departments</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 12 }}>Leave empty for organization-wide</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {departments.map(d => (
                  <label key={d._id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 'var(--radius-md)', cursor: 'pointer', background: form.departmentIds.includes(d._id) ? 'rgba(99,102,241,0.1)' : 'transparent', transition: 'background var(--transition-fast)' }}>
                    <input type="checkbox" checked={form.departmentIds.includes(d._id)} onChange={() => handleDeptToggle(d._id)} style={{ accentColor: 'var(--primary-500)' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                    <span style={{ fontSize: '0.85rem' }}>{d.name}</span>
                  </label>
                ))}
                {departments.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No departments. Create one in settings.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 10, flexDirection: 'column' }}>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} disabled={loading} onClick={(e) => handleSubmit(e, true)}>
                <Send size={16} /> {loading ? 'Publishing...' : 'Save & Publish'}
              </button>
              <button type="submit" className="btn btn-secondary" style={{ width: '100%' }} disabled={loading}>
                <Save size={16} /> {loading ? 'Saving...' : 'Save as Draft'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
