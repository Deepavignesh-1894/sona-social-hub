import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as usersApi } from '../api';
import './Profile.css';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await usersApi.updateProfile({ displayName: displayName.trim() });
      await refreshUser();
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <h1>Edit profile</h1>
      <div className="profile-card card">
        <p className="profile-email">{user?.email}</p>
        <p className="profile-role">Role: {user?.role} {user?.officialTitle && ` · ${user.officialTitle}`}</p>
        {user?.role === 'official' && !user?.isOfficialApproved && (
          <p className="profile-pending">⏳ Your official account is pending admin approval. You can only view until then.</p>
        )}
        <form onSubmit={handleSubmit} className="profile-form">
          <label className="auth-label">Display name</label>
          <input
            type="text"
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Display name"
          />
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
        {message && <p className="profile-msg">{message}</p>}
      </div>
    </div>
  );
}
