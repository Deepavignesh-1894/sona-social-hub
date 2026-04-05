import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../api';
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
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.toLowerCase().endsWith('@sonatech.ac.in')) {
      setError('Only @sonatech.ac.in email addresses are allowed.');
      return;
    }
    setLoading(true);
    try {
      const result = await auth.register({
        email: email.trim(),
        password,
        displayName: displayName.trim(),
        role,
        officialTitle: role === 'official' ? officialTitle : undefined,
      });

      if (result.requiresVerification) {
        setUserId(result.userId);
        setShowVerification(true);
      } else {
        // If no verification required (backward compatibility), login immediately
        localStorage.setItem('token', result.token);
        window.location.href = '/app';
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    try {
      const result = await auth.verifyEmail(userId, otp);
      localStorage.setItem('token', result.token);
      window.location.href = '/app';
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendLoading(true);
    try {
      await auth.resendOtp(userId);
      alert('OTP resent! Please check your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="auth-page">
        <button type="button" className="theme-toggle auth-theme" onClick={toggle} aria-label="Toggle theme">
          {dark ? '☀️' : '🌙'}
        </button>
        <div className="auth-card card">
          <h1>Verify Your Email</h1>
          <p className="auth-sub">Enter the 6-digit OTP sent to {email}</p>
          <form onSubmit={handleVerifyEmail} className="auth-form">
            {error && <div className="auth-error">{error}</div>}
            <input
              type="text"
              className="input"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
            />
            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={handleResendOtp}
              disabled={resendLoading}
            >
              {resendLoading ? 'Sending…' : 'Resend OTP'}
            </button>
          </form>
          <p className="auth-footer">
            Already verified? <Link to="/login">Log in</Link>
          </p>
        </div>
        <Link to="/" className="auth-back">← Back to home</Link>
      </div>
    );
  }

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
