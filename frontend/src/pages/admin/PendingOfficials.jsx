import { useState, useEffect } from 'react';
import { users as usersApi } from '../../api';
import './Admin.css';

export default function PendingOfficials() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    usersApi.adminAll().then((users) => {
      setList(users.filter((u) => u.role === 'official' && !u.isOfficialApproved));
    }).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleApprove = async (id) => {
    try {
      await usersApi.adminApproveOfficial(id);
      setList((prev) => prev.filter((u) => u._id !== id));
    } catch (e) {
      alert(e.message || 'Failed');
    }
  };

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>Pending officials</h1>
      <p className="admin-sub">Approve or leave pending. Approved officials can post and create groups.</p>
      {list.length === 0 ? (
        <p className="admin-empty">No pending officials.</p>
      ) : (
        <ul className="admin-list">
          {list.map((u) => (
            <li key={u._id} className="admin-list-item card">
              <div>
                <strong>{u.email}</strong>
                {u.displayName && <span> · {u.displayName}</span>}
                {u.officialTitle && <span> · {u.officialTitle}</span>}
              </div>
              <button type="button" className="btn btn-primary" onClick={() => handleApprove(u._id)}>
                Approve
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
