import { useState, useEffect } from 'react';
import { reports as reportsApi, posts as postsApi, comments as commentsApi, messages as messagesApi, admin as adminApi } from '../../api';
import './Admin.css';

export default function Reports() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    reportsApi.list().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const setStatus = async (id, status) => {
    try {
      await reportsApi.setStatus(id, status);
      setList((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
    } catch (e) {
      alert(e.message || 'Failed');
    }
  };

  const deleteTarget = async (report) => {
    try {
      if (report.targetType === 'post') {
        await postsApi.delete(report.targetId._id);
      } else if (report.targetType === 'comment') {
        await commentsApi.delete(report.targetId._id);
      } else if (report.targetType === 'message') {
        await messagesApi.delete(report.targetId._id);
      }
      await setStatus(report._id, 'resolved');
      alert('Deleted reported content');
    } catch (e) {
      alert(e.message || 'Failed to delete');
    }
  };

  const banUser = async (report) => {
    const userId = report.targetId?.author?._id;
    if (!userId) return;
    if (!window.confirm('Ban this user?')) return;
    try {
      await adminApi.banUser(userId, true);
      alert('User banned');
    } catch (e) {
      alert(e.message || 'Failed to ban user');
    }
  };

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>Reports</h1>
      <p className="admin-sub">Review reported posts and comments. Mark as reviewed or resolved.</p>
      {list.length === 0 ? (
        <p className="admin-empty">No reports.</p>
      ) : (
        <ul className="admin-list">
          {list.map((r) => (
            <li key={r._id} className="admin-list-item card">
              <div>
                <strong>{r.targetType} · {r.status}</strong>
                {r.targetId ? (
                  <div className="admin-report-target">
                    <p><strong>Content:</strong> {r.targetId.content || r.targetId.title || '[No text]'}</p>
                    <p><strong>Author:</strong> {r.targetId.author?.displayName || r.targetId.author?.randomName || 'Unknown'}{r.targetId.author?.officialTitle ? ` · ${r.targetId.author.officialTitle}` : ''}</p>
                  </div>
                ) : (
                  <p>Target not available</p>
                )}
                {r.reason && <p>Reason: {r.reason}</p>}
                <span className="admin-meta">Reported by {r.reportedBy?.email || 'Unknown'} · {new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <div className="admin-report-actions">
                <button type="button" className="btn btn-warning" onClick={() => deleteTarget(r)}>
                  Delete content
                </button>
                <button type="button" className="btn btn-danger" onClick={() => banUser(r)}>
                  Ban user
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setStatus(r._id, 'reviewed')}>
                  Reviewed
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setStatus(r._id, 'resolved')}>
                  Resolved
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
