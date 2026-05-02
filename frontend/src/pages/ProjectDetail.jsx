import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, UserPlus, Trash2, ArrowLeft, Edit2, Users, ListTodo } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, PriorityBadge, RoleBadge } from '../components/Badges';
import TaskModal from '../components/TaskModal';
import AddMemberModal from '../components/AddMemberModal';
import { format, isPast } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [taskFilter, setTaskFilter] = useState({ status: '', priority: '' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);

  const fetchProject = () => {
    setLoading(true);
    api.get(`/projects/${id}`)
      .then(r => setProject(r.data.project))
      .catch(err => { if (err.response?.status === 403) navigate('/projects'); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchProject, [id]);

  const myRole = project?.myRole;
  const isAdmin = myRole === 'ADMIN';

  const filteredTasks = (project?.tasks || []).filter(t => {
    if (taskFilter.status && t.status !== taskFilter.status) return false;
    if (taskFilter.priority && t.priority !== taskFilter.priority) return false;
    return true;
  });

  const handleTaskSaved = (savedTask) => {
    setProject(p => {
      const exists = p.tasks.find(t => t.id === savedTask.id);
      return {
        ...p,
        tasks: exists
          ? p.tasks.map(t => t.id === savedTask.id ? savedTask : t)
          : [savedTask, ...p.tasks],
      };
    });
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setProject(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== taskId) }));
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete.'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      setProject(p => ({ ...p, members: p.members.filter(m => m.userId !== userId) }));
    } catch (err) { alert(err.response?.data?.message || 'Failed to remove member.'); }
  };

  const handleMemberAdded = (membership) => {
    setProject(p => ({ ...p, members: [...p.members, membership] }));
  };

  const handleDeleteProject = async () => {
    if (!window.confirm(`Delete project "${project.name}"? This is irreversible.`)) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) { alert(err.response?.data?.message || 'Failed to delete project.'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!project) return null;

  const todoCount = project.tasks.filter(t => t.status === 'TODO').length;
  const inProgressCount = project.tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const doneCount = project.tasks.filter(t => t.status === 'DONE').length;
  const total = project.tasks.length;
  const progressPct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')} style={{ marginBottom: 16 }}>
          <ArrowLeft size={14} /> Back to Projects
        </button>
        <div className="page-header">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <h1 className="page-title truncate">{project.name}</h1>
              <RoleBadge role={myRole} />
            </div>
            {project.description && <p className="page-subtitle">{project.description}</p>}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>Progress</span><span>{progressPct}% complete ({doneCount}/{total})</span>
              </div>
              <div className="progress-bar-wrap"><div className="progress-bar" style={{ width: `${progressPct}%` }} /></div>
            </div>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}><Trash2 size={14} /> Delete Project</button>
            </div>
          )}
        </div>

        {/* Quick stats */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
          {[
            { label: 'To Do', val: todoCount, color: 'var(--text-muted)' },
            { label: 'In Progress', val: inProgressCount, color: 'var(--sky)' },
            { label: 'Done', val: doneCount, color: 'var(--emerald)' },
            { label: 'Members', val: project.members.length, color: 'var(--accent-light)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="card card-sm" style={{ minWidth: 100, textAlign: 'center', padding: '12px 20px' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn${activeTab === 'tasks' ? ' active' : ''}`} onClick={() => setActiveTab('tasks')}>
          <ListTodo size={14} style={{ display: 'inline', marginRight: 6 }} />Tasks ({total})
        </button>
        <button className={`tab-btn${activeTab === 'members' ? ' active' : ''}`} onClick={() => setActiveTab('members')}>
          <Users size={14} style={{ display: 'inline', marginRight: 6 }} />Members ({project.members.length})
        </button>
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div className="filter-bar" style={{ margin: 0 }}>
              <select className="filter-select" value={taskFilter.status} onChange={e => setTaskFilter(p => ({ ...p, status: e.target.value }))}>
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <select className="filter-select" value={taskFilter.priority} onChange={e => setTaskFilter(p => ({ ...p, priority: e.target.value }))}>
                <option value="">All Priorities</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
            {isAdmin && (
              <button id="create-task-btn" className="btn btn-primary btn-sm" onClick={() => { setEditTask(null); setShowTaskModal(true); }}>
                <Plus size={16} /> Add Task
              </button>
            )}
          </div>

          {filteredTasks.length === 0
            ? <div className="empty-state"><div className="empty-icon">📋</div><div className="empty-title">No tasks found</div></div>
            : <div className="task-list">
                {filteredTasks.map(task => {
                  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
                  return (
                    <div key={task.id} className={`task-item${isOverdue ? ' overdue' : ''}`}>
                      <div className="task-item-content">
                        <div className="task-title">{task.title}</div>
                        <div className="task-meta">
                          {task.assignee && <span className="task-meta-text">→ {task.assignee.name}</span>}
                          {task.dueDate && (
                            <span className={`task-meta-text${isOverdue ? ' overdue-label' : ''}`}>
                              📅 {format(new Date(task.dueDate), 'MMM d, yyyy')}{isOverdue ? ' · OVERDUE' : ''}
                            </span>
                          )}
                          <span className="task-meta-text">by {task.createdBy?.name}</span>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      <button className="btn btn-icon btn-secondary btn-sm" title="Edit" onClick={() => { setEditTask(task); setShowTaskModal(true); }}>
                        <Edit2 size={14} />
                      </button>
                      {isAdmin && (
                        <button className="btn btn-icon btn-danger btn-sm" title="Delete" onClick={() => handleDeleteTask(task.id)}>
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
          }
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          {isAdmin && (
            <div style={{ marginBottom: 16 }}>
              <button className="btn btn-primary btn-sm" onClick={() => setShowMemberModal(true)}>
                <UserPlus size={16} /> Add Member
              </button>
            </div>
          )}
          <div className="task-list">
            {project.members.map(m => (
              <div key={m.userId} className="task-item" style={{ cursor: 'default' }}>
                <div className="user-avatar" style={{ flexShrink: 0 }}>{m.user?.name?.[0]?.toUpperCase()}</div>
                <div className="task-item-content">
                  <div className="task-title">{m.user?.name}</div>
                  <div className="task-meta-text">{m.user?.email}</div>
                </div>
                <RoleBadge role={m.role} />
                {isAdmin && m.userId !== project.ownerId && m.userId !== user?.id && (
                  <button className="btn btn-icon btn-danger btn-sm" title="Remove" onClick={() => handleRemoveMember(m.userId)}>
                    <Trash2 size={14} />
                  </button>
                )}
                {m.userId === project.ownerId && <span className="badge badge-admin" style={{ fontSize: '0.65rem' }}>Owner</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <TaskModal
          projectId={id}
          task={editTask}
          members={project.members}
          myRole={myRole}
          onClose={() => { setShowTaskModal(false); setEditTask(null); }}
          onSaved={handleTaskSaved}
        />
      )}
      {showMemberModal && (
        <AddMemberModal projectId={id} onClose={() => setShowMemberModal(false)} onAdded={handleMemberAdded} />
      )}
    </div>
  );
}
