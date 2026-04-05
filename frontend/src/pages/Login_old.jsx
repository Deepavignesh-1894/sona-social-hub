import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { auth } from '../api';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  // Email verification states (for users trying to login before verifying)
  const [showVerification, setShowVerification] = useState(false);
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/app');
    } catch (err) {
      // Check if the error is due to unverified email
      if (err.message && err.message.includes('Email not verified')) {
        // Try to get the userId from the login attempt
        try {
          const result = await auth.login(email.trim(), password);
          if (result.requiresVerification && result.userId) {
            setUserId(result.userId);
            setShowVerification(true);
          }
        } catch (loginErr) {
          if (loginErr.message && loginErr.message.includes('Email not verified') && loginErr.userId) {
            setUserId(loginErr.userId);
            setShowVerification(true);
          } else {
            setError(err.message || 'Login failed');
          }
        }
      } else {
        setError(err.message || 'Login failed');
      }
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
          <h1>Email Not Verified</h1>
          <p className="auth-sub">Please verify your email to continue. Enter the 6-digit OTP sent to {email}</p>
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
            <Link to="/login">Back to Login</Link>
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
        </p>
      </div>
      <Link to="/" className="auth-back">← Back to home</Link>
    </div>
  );
}
