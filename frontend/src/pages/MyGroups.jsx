import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groups as groupsApi } from '../api';
import './Groups.css';

export default function MyGroups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    groupsApi
      .my()
      .then(setGroups)
      .catch(() => setGroups([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="groups-page"><div className="groups-loading">Loading…</div></div>;
  if (groups.length === 0) {
    return (
      <div className="groups-page">
        <h1>My groups</h1>
        <p className="groups-empty">You haven't joined any groups yet. <Link to="/app/join-group">Browse and join</Link>.</p>
      </div>
    );
  }

  return (
    <div className="groups-page">
      <h1>My groups</h1>
      <div className="groups-grid">
        {groups.map((g) => (
          <Link key={g._id} to={`/app/group/${g._id}`} className="group-card card">
            <h3>{g.name}</h3>
            {g.description && <p>{g.description}</p>}
            <span className="group-card-link">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
