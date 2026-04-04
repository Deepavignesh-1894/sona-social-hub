import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../api';
import '../pages/Auth.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      setLoading(true);
      await auth.forgotPassword(email);
      setSuccess('If an account exists with this email, a password reset link has been sent!');
      setEmail('');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to process request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        {error && <div style={{ color: '#d32f2f', marginBottom: '10px' }}>{error}</div>}
        {success && <div style={{ color: '#4caf50', marginBottom: '10px' }}>{success}</div>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            style={{ marginBottom: '20px' }}
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
