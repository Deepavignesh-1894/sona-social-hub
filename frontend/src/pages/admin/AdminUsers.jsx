import { useState, useEffect } from 'react';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getAllUsers(page, 50, search);
      setUsers(result.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('⚠️ This will delete the user and all their content. Are you sure?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setErrors({ ...errors, [userId]: '' });
    } catch (err) {
      setErrors({ ...errors, [userId]: err.message });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );
      setErrors({ ...errors, [userId]: '' });
    } catch (err) {
      setErrors({ ...errors, [userId]: err.message });
    }
  };

  const handleVerifyEmail = async (userId) => {
    try {
      await adminApi.verifyUserEmail(userId);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, emailVerified: true } : u))
      );
      setErrors({ ...errors, [userId]: '' });
    } catch (err) {
      setErrors({ ...errors, [userId]: err.message });
    }
  };

  const handleBanUser = async (userId, ban) => {
    try {
      await adminApi.banUser(userId, ban);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBanned: ban } : u))
      );
      setErrors({ ...errors, [userId]: '' });
    } catch (err) {
      setErrors({ ...errors, [userId]: err.message });
    }
  };

  const getUnverifiedCount = () => users.filter((u) => !u.emailVerified).length;
  const getBannedCount = () => users.filter((u) => u.isBanned).length;

  return (
    <div className="admin-page">
      <h1>👥 User Management</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search users by email or name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '5px',
            border: '1px solid #ddd',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
        <div style={{
          padding: '15px',
          backgroundColor: '#fff3e0',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f57c00' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Total Users</div>
        </div>
        <div style={{
          padding: '15px',
          backgroundColor: '#fce4ec',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#c2185b' }}>
            {getUnverifiedCount()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Unverified</div>
        </div>
        <div style={{
          padding: '15px',
          backgroundColor: '#ffebee',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#d32f2f' }}>
            {getBannedCount()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>Banned</div>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">Loading…</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: 'white',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <thead style={{ backgroundColor: '#f5f5f5' }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Email</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Name</th>
                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Role</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Status</th>
                <th style={{ padding: '10px', textAlign: 'center', borderBottom: '1px solid #ddd' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '10px' }}>{user.email}</td>
                  <td style={{ padding: '10px' }}>{user.displayName || '—'}</td>
                  <td style={{ padding: '10px' }}>
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user._id, e.target.value)}
                      style={{
                        padding: '5px',
                        borderRadius: '3px',
                        border: '1px solid #ddd',
                        fontSize: '12px'
                      }}
                    >
                      <option value="student">Student</option>
                      <option value="official">Official</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px' }}>
                    {user.emailVerified ? (
                      <span style={{ color: '#4caf50' }}>✅ Verified</span>
                    ) : (
                      <span style={{ color: '#ff9800' }}>⏳ Unverified</span>
                    )}
                    {user.isBanned && (
                      <div style={{ color: '#d32f2f', marginTop: '3px' }}>🚫 Banned</div>
                    )}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    {!user.emailVerified && (
                      <button
                        onClick={() => handleVerifyEmail(user._id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#4caf50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          marginRight: '5px',
                          fontSize: '12px'
                        }}
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleBanUser(user._id, !user.isBanned)}
                      style={{
                        padding: '4px 8px',
                        backgroundColor: user.isBanned ? '#4caf50' : '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        marginRight: '5px',
                        fontSize: '12px'
                      }}
                    >
                      {user.isBanned ? 'Unban' : 'Ban'}
                    </button>
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#d32f2f',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errors.general && <div style={{ color: '#d32f2f', marginTop: '10px' }}>{errors.general}</div>}
    </div>
  );
}
