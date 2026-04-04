import { useState } from 'react';
import { auth } from '../api';

export default function EmailVerificationBanner({ user, onVerified }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (user?.emailVerified) return null;

  const handleResend = async () => {
    setError('');
    setMessage('');
    try {
      setLoading(true);
      const result = await auth.resendVerification();
      setMessage(result.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '4px',
      padding: '15px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px'
    }}>
      <div>
        <strong style={{ color: '#856404' }}>📧 Email Not Verified</strong>
        <p style={{ 
          color: '#856404', 
          margin: '5px 0 0 0',
          fontSize: '14px'
        }}>
          Please verify your email address to unlock all features.
        </p>
        {message && <p style={{ color: '#4caf50', margin: '5px 0 0 0', fontSize: '14px' }}>{message}</p>}
        {error && <p style={{ color: '#d32f2f', margin: '5px 0 0 0', fontSize: '14px' }}>{error}</p>}
      </div>

      <button
        onClick={handleResend}
        disabled={loading}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ffc107',
          color: '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
          marginRight: '10px',
          whiteSpace: 'nowrap'
        }}
      >
        {loading ? 'Sending...' : 'Resend Verification'}
      </button>
    </div>
  );
}
