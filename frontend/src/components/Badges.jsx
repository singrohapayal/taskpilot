import React from 'react';

export function StatusBadge({ status }) {
  const map = {
    TODO: ['badge-todo', 'To Do'],
    IN_PROGRESS: ['badge-in-progress', 'In Progress'],
    DONE: ['badge-done', 'Done'],
  };
  const [cls, label] = map[status] || ['badge-todo', status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function PriorityBadge({ priority }) {
  const map = {
    LOW: ['badge-low', '↓ Low'],
    MEDIUM: ['badge-medium', '→ Medium'],
    HIGH: ['badge-high', '↑ High'],
  };
  const [cls, label] = map[priority] || ['badge-medium', priority];
  return <span className={`badge ${cls}`}>{label}</span>;
}

export function RoleBadge({ role }) {
  return <span className={`badge ${role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{role}</span>;
}
