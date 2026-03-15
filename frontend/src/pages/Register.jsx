import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

const ROLES = [
  { value: 'student', label: 'Student' },
  { value: 'official', label: 'Official (Professor / HoD / etc.)' },
];

const TITLES = ['', 'Professor', 'Assistant Professor', 'HoD', 'Principal'];

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('student');
  const [officialTitle, setOfficialTitle] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.toLowerCase().endsWith('@sonatech.ac.in')) {
      setError('Only @sonatech.ac.in email addresses are allowed.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        role,
        officialTitle: role === 'official' ? officialTitle : undefined,
      });
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <button type="button" className="theme-toggle auth-theme" onClick={toggle} aria-label="Toggle theme">
        {dark ? '☀️' : '🌙'}
      </button>
      <div className="auth-card card">
        <h1>Sona Social Hub</h1>
        <p className="auth-sub">Register with your @sonatech.ac.in account</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <input
            type="email"
            className="input"
            placeholder="you@sonatech.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="Password (min 6)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <input
            type="text"
            className="input"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <label className="auth-label">I am a</label>
          <select
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
          {role === 'official' && (
            <>
              <label className="auth-label">Title</label>
              <select
                className="input"
                value={officialTitle}
                onChange={(e) => setOfficialTitle(e.target.value)}
              >
                {TITLES.map((t) => (
                  <option key={t || 'none'} value={t}>{t || 'Select…'}</option>
                ))}
              </select>
              <p className="auth-hint">Officials need admin approval before posting or creating groups.</p>
            </>
          )}
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
      <Link to="/" className="auth-back">← Back to home</Link>
    </div>
  );
}
