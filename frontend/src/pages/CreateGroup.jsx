import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { groups as groupsApi } from '../api';
import './Groups.css';

export default function CreateGroup() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Group name is required');
      return;
    }
    setLoading(true);
    try {
      const g = await groupsApi.create({ name: name.trim(), description: description.trim() });
      navigate(`/app/group/${g._id}`);
    } catch (err) {
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="groups-page">
      <h1>Create a group</h1>
      <form onSubmit={handleSubmit} className="groups-form card">
        {error && <div className="auth-error">{error}</div>}
        <label className="auth-label">Group name</label>
        <input
          type="text"
          className="input"
          placeholder="e.g. IT CSE"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="auth-label">Description (optional)</label>
        <textarea
          className="input"
          placeholder="What is this group about?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating…' : 'Create group'}
        </button>
      </form>
    </div>
  );
}
