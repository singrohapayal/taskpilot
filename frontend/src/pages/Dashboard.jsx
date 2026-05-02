import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { FolderKanban, CheckSquare, AlertTriangle, ListTodo, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../contexts/AuthContext';
import { StatusBadge, PriorityBadge } from '../components/Badges';
import { format, isAfter } from 'date-fns';

const PIE_COLORS = ['#94a3b8', '#38bdf8', '#10b981'];
const BAR_COLOR = '#6366f1';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><div className="empty-icon">⚠️</div><div className="empty-title">Failed to load dashboard</div></div>;

  const { stats, statusCounts, tasksPerProject, myTasks, overdueTasks, recentTasks } = data;

  const pieData = [
    { name: 'To Do', value: statusCounts.TODO },
    { name: 'In Progress', value: statusCounts.IN_PROGRESS },
    { name: 'Done', value: statusCounts.DONE },
  ];

  const statCards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
    { label: 'Total Tasks', value: stats.totalTasks, icon: ListTodo, color: '#a855f7', glow: 'rgba(168,85,247,0.2)' },
    { label: 'My Tasks', value: stats.myTasksCount, icon: CheckSquare, color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
    { label: 'Overdue', value: stats.overdueCount, icon: AlertTriangle, color: '#f43f5e', glow: 'rgba(244,63,94,0.2)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">👋 Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="page-subtitle">Here's what's happening across your projects today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stat-grid" style={{ marginBottom: 28 }}>
        {statCards.map(({ label, value, icon: Icon, color, glow }) => (
          <div key={label} className="stat-card" style={{ '--glow-color': glow }}>
            <div className="stat-icon" style={{ background: `${color}22`, color }}>
              <Icon size={22} />
            </div>
            <div className="stat-value">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid-2" style={{ marginBottom: 28 }}>
        <div className="card">
          <div className="section-title">Task Status Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              <Legend iconType="circle" iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Tasks per Project</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tasksPerProject} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
              <XAxis dataKey="projectName" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
              <Bar dataKey="taskCount" fill={BAR_COLOR} radius={[4, 4, 0, 0]} name="Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Overdue Tasks */}
      {overdueTasks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div className="section-title" style={{ color: 'var(--rose)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={18} /> Overdue Tasks ({overdueTasks.length})
          </div>
          <div className="task-list">
            {overdueTasks.map(task => (
              <div key={task.id} className="task-item overdue" onClick={() => navigate(`/projects/${task.project.id}`)}>
                <div className="task-item-content">
                  <div className="task-title">{task.title}</div>
                  <div className="task-meta">
                    <span className="task-meta-text"><Clock size={12} /> {format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                    <span className="task-meta-text">{task.project.name}</span>
                  </div>
                </div>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Tasks & Recent */}
      <div className="grid-2">
        <div>
          <div className="section-title">My Assigned Tasks</div>
          {myTasks.length === 0
            ? <div className="empty-state" style={{ padding: '32px 16px' }}><div className="empty-icon">✅</div><div className="empty-title">No tasks assigned</div></div>
            : <div className="task-list">
                {myTasks.slice(0, 6).map(task => (
                  <div key={task.id} className="task-item" onClick={() => navigate(`/projects/${task.project.id}`)}>
                    <div className="task-item-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className="task-meta-text">{task.project.name}</span>
                        {task.dueDate && <span className="task-meta-text"><Clock size={11} /> {format(new Date(task.dueDate), 'MMM d')}</span>}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                ))}
              </div>
          }
        </div>

        <div>
          <div className="section-title">Recent Activity</div>
          {recentTasks.length === 0
            ? <div className="empty-state" style={{ padding: '32px 16px' }}><div className="empty-title">No recent tasks</div></div>
            : <div className="task-list">
                {recentTasks.map(task => (
                  <div key={task.id} className="task-item" onClick={() => navigate(`/projects/${task.project.id}`)}>
                    <div className="task-item-content">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span className="task-meta-text">{task.project.name}</span>
                        {task.assignee && <span className="task-meta-text">→ {task.assignee.name}</span>}
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
          }
        </div>
      </div>
    </div>
  );
}
