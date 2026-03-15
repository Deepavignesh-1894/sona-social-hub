import { useState, useEffect } from 'react';
import { users as usersApi } from '../../api';
import './Admin.css';

const ROLES = ['student', 'official', 'admin'];

export default function AllMembers() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.adminAll().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const setRole = async (id, role) => {
    try {
      await usersApi.adminSetRole(id, role);
      setList((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
    } catch (e) {
      alert(e.message || 'Failed');
    }
  };

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>All members</h1>
      <p className="admin-sub">Only admin can see emails. You can promote/demote roles.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Display name</th>
              <th>Role</th>
              <th>Official title</th>
              <th>Approved</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.displayName || '—'}</td>
                <td>{u.role}</td>
                <td>{u.officialTitle || '—'}</td>
                <td>{u.role === 'official' ? (u.isOfficialApproved ? 'Yes' : 'No') : '—'}</td>
                <td>
                  <select
                    value={u.role}
                    onChange={(e) => setRole(u._id, e.target.value)}
                    className="admin-select"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
