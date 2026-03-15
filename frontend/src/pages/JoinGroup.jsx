import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { groups as groupsApi } from '../api';
import './Groups.css';

export default function JoinGroup() {
  const [all, setAll] = useState([]);
  const [myIds, setMyIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    Promise.all([groupsApi.list(), groupsApi.my()])
      .then(([list, my]) => {
        setAll(list);
        setMyIds(new Set(my.map((g) => g._id)));
      })
      .catch(() => setAll([]))
      .finally(() => setLoading(false));
  }, []);

  const handleJoin = async (id) => {
    setJoining(id);
    try {
      await groupsApi.join(id);
      setMyIds((prev) => new Set([...prev, id]));
    } catch (e) {
      alert(e.message || 'Failed to join');
    } finally {
      setJoining(null);
    }
  };

  if (loading) return <div className="groups-page"><div className="groups-loading">Loading…</div></div>;

  return (
    <div className="groups-page">
      <h1>Join a group</h1>
      <p className="groups-sub">Browse communities and join to see their feed.</p>
      <div className="groups-grid">
        {all.map((g) => {
          const isMember = myIds.has(g._id);
          return (
            <div key={g._id} className="group-card card">
              <h3>{g.name}</h3>
              {g.description && <p>{g.description}</p>}
              <p className="group-card-meta">By {g.createdBy?.displayName || g.createdBy?.email || 'Unknown'}</p>
              {isMember ? (
                <Link to={`/app/group/${g._id}`} className="btn btn-primary">Open</Link>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleJoin(g._id)}
                  disabled={joining === g._id}
                >
                  {joining === g._id ? 'Joining…' : 'Join'}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {all.length === 0 && <p className="groups-empty">No groups yet.</p>}
    </div>
  );
}
