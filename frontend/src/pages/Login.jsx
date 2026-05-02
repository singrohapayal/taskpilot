import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const fillDemo = (type) => {
    if (type === 'admin') setForm({ email: 'admin@taskpilot.dev', password: 'Admin@123' });
    else setForm({ email: 'member@taskpilot.dev', password: 'Member@123' });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ TaskPilot</div>
        <div className="auth-tagline">Your team's command center</div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input id="login-email" className="form-input" type="email" value={form.email}
              onChange={set('email')} placeholder="you@company.com" required autoFocus />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="login-password" className="form-input" type="password" value={form.password}
              onChange={set('password')} placeholder="••••••••" required />
          </div>
          <button id="login-submit" type="submit" className="btn btn-primary w-full" style={{ justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider" />
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }} onClick={() => fillDemo('admin')}>
            Demo Admin
          </button>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.78rem' }} onClick={() => fillDemo('member')}>
            Demo Member
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create one free</Link>
        </div>
      </div>
    </div>
  );
}
