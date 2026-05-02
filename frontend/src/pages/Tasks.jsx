import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Filter } from 'lucide-react';
import api from '../api/axios';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { format, isPast } from 'date-fns';

export default function Tasks() {
  const navigate = useNavigate();
  const [allTasks, setAllTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '' });

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setAllTasks(r.data.myTasks || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = allTasks.filter(t => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    return true;
  });

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Tasks</h1>
          <p className="page-subtitle">All tasks assigned to you across all projects</p>
        </div>
      </div>

      <div className="filter-bar">
        <Filter size={16} style={{ color: 'var(--text-muted)', alignSelf: 'center' }} />
        <select className="filter-select" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <select className="filter-select" value={filters.priority} onChange={e => setFilters(p => ({ ...p, priority: e.target.value }))}>
          <option value="">All Priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        {(filters.status || filters.priority) && (
          <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: '', priority: '' })}>Clear</button>
        )}
      </div>

      {filtered.length === 0
        ? <div className="empty-state"><div className="empty-icon">✅</div><div className="empty-title">No tasks found</div><p className="text-sm text-muted">Tasks assigned to you will appear here.</p></div>
        : (
          <div className="task-list">
            {filtered.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
              return (
                <div key={task.id} className={`task-item${isOverdue ? ' overdue' : ''}`}
                  onClick={() => navigate(`/projects/${task.project.id}`)}>
                  <div className="task-item-content">
                    <div className="task-title">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-meta-text">📁 {task.project.name}</span>
                      {task.dueDate && (
                        <span className={`task-meta-text${isOverdue ? ' overdue-label' : ''}`}>
                          <Clock size={11} /> {format(new Date(task.dueDate), 'MMM d, yyyy')}
                          {isOverdue ? ' · OVERDUE' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
