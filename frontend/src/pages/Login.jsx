import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Login failed');
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
        <p className="auth-sub">Log in with your @sonatech.ac.in account</p>
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
          <br />
          <Link to="/forgot-password" style={{ fontSize: '14px', marginTop: '10px', display: 'inline-block' }}>Forgot password?</Link>
        </p>
      </div>
      <Link to="/" className="auth-back">← Back to home</Link>
    </div>
  );
}
