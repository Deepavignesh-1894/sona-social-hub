import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function AllGroups() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.allGroups().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>All groups</h1>
      {list.length === 0 ? (
        <p className="admin-empty">No groups.</p>
      ) : (
        <ul className="admin-list">
          {list.map((g) => (
            <li key={g._id} className="admin-list-item card">
              <div>
                <strong>{g.name}</strong>
                {g.description && <p className="admin-desc">{g.description}</p>}
                <span className="admin-meta">By {g.createdBy?.email || 'Unknown'}</span>
              </div>
              <div className="admin-group-actions">
                <Link to={`/app/group/${g._id}`} className="btn btn-primary">Open</Link>
                <Link to={`/app/admin/group-activity/${g._id}`} className="btn btn-ghost">Activity</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
