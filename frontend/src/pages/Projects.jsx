import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FolderOpen, Users, CheckSquare } from 'lucide-react';
import api from '../api/axios';
import { RoleBadge } from '../components/Badges';
import { format } from 'date-fns';

function ProjectModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Project name is required.');
    setLoading(true);
    try {
      const { data } = await api.post('/projects', form);
      onCreated(data.project);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">New Project</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Project Name *</label>
            <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Product Launch 2025" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="What is this project about?" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data.projects)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📁</div>
          <div className="empty-title">No projects yet</div>
          <p className="text-sm text-muted" style={{ marginBottom: 20 }}>Create your first project to get started.</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Create Project</button>
        </div>
      ) : (
        <div className="grid-3">
          {projects.map(project => (
            <div key={project.id} className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                  <div className="project-name">{project.name}</div>
                  <RoleBadge role={project.myRole} />
                </div>
                <div className="project-desc">{project.description || 'No description provided.'}</div>
              </div>
              <div className="project-footer">
                <div className="member-avatars">
                  {project.members.slice(0, 4).map(m => (
                    <div key={m.userId} className="member-avatar-sm" title={m.user.name}>
                      {m.user.name[0].toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 4 && (
                    <div className="member-avatar-sm" style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                      +{project.members.length - 4}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span><Users size={12} style={{ display: 'inline', marginRight: 3 }} />{project.members.length}</span>
                  <span><CheckSquare size={12} style={{ display: 'inline', marginRight: 3 }} />{project._count?.tasks || 0}</span>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Created {format(new Date(project.createdAt), 'MMM d, yyyy')}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <ProjectModal onClose={() => setShowModal(false)} onCreated={p => setProjects(prev => [p, ...prev])} />}
    </div>
  );
}
