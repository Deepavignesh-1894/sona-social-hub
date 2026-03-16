import { useState, useEffect } from 'react';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function AllMembersDetailed() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.allUsersDetailed()
      .then(setList)
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>All members with groups</h1>
      <p className="admin-sub">Detailed view of all users and their group memberships.</p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
              <th>Official title</th>
              <th>Groups</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u._id}>
                <td>{u.email}</td>
                <td>{u.role === 'official' ? u.displayName : u.randomName || u.displayName}</td>
                <td>{u.role}</td>
                <td>{u.officialTitle || '—'}</td>
                <td>
                  {u.groups?.length > 0 ? (
                    <div className="admin-groups-list">
                      {u.groups.map((g) => (
                        <span key={g._id} className={`admin-group-tag ${g.isPublic ? 'public' : 'private'}`}>
                          {g.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'No groups'
                  )}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}