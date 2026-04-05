import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reports as reportsApi, posts as postsApi, comments as commentsApi, messages as messagesApi, admin as adminApi, groups as groupsApi } from '../../api';
import './Admin.css';

export default function Reports() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupModal, setGroupModal] = useState(null);
  const [groupDetails, setGroupDetails] = useState(null);
  const [groupLoading, setGroupLoading] = useState(false);
  const navigate = useNavigate();

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

  const viewTarget = (report) => {
    if (report.targetType === 'post' || report.targetType === 'comment') {
      navigate('/app');
    } else if (report.targetType === 'message' && report.targetId?.group) {
      navigate(`/app/groups/${report.targetId.group}`);
    }
  };

  const viewGroupDetails = async (groupId) => {
    if (!groupId) return;
    setGroupLoading(true);
    try {
      const group = await groupsApi.get(groupId);
      setGroupDetails(group);
      setGroupModal(groupId);
    } catch (e) {
      alert(e.message || 'Failed to load group details');
    } finally {
      setGroupLoading(false);
    }
  };

  const closeGroupModal = () => {
    setGroupModal(null);
    setGroupDetails(null);
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
                    <p><strong>Author Email:</strong> {r.targetId.author?.email || 'N/A'}</p>
                    {r.targetType === 'message' && r.targetId.group && (
                      <p>
                        <strong>Group:</strong>{' '}
                        <button 
                          type="button" 
                          className="btn btn-link" 
                          onClick={() => viewGroupDetails(r.targetId.group._id || r.targetId.group)}
                          style={{ padding: 0, textDecoration: 'underline' }}
                        >
                          {r.targetId.group.name || 'Unknown Group'}
                        </button>
                      </p>
                    )}
                  </div>
                ) : (
                  <p>Target not available</p>
                )}
                {r.reason && <p>Reason: {r.reason}</p>}
                <span className="admin-meta">Reported by {r.reportedBy?.email || 'Unknown'} · {new Date(r.createdAt).toLocaleString()}</span>
              </div>
              <div className="admin-report-actions">
                <button type="button" className="btn btn-secondary" onClick={() => viewTarget(r)}>
                  View
                </button>
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

      {/* Group Details Modal */}
      {groupModal && (
        <div className="modal-overlay" onClick={closeGroupModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Group Details</h2>
              <button type="button" className="btn btn-ghost" onClick={closeGroupModal}>×</button>
            </div>
            <div className="modal-body">
              {groupLoading ? (
                <p>Loading...</p>
              ) : groupDetails ? (
                <div>
                  <h3>{groupDetails.name}</h3>
                  <p><strong>Description:</strong> {groupDetails.description || 'No description'}</p>
                  <p><strong>Total Members:</strong> {groupDetails.members?.length || 0}</p>
                  {groupDetails.members?.length > 0 && (
                    <div>
                      <strong>Members:</strong>
                      <ul className="member-list">
                        {groupDetails.members.map((member) => (
                          <li key={member._id}>
                            {member.displayName || member.randomName || 'Unknown'}
                            {member.officialTitle && ` · ${member.officialTitle}`}
                            <span className="member-role">({member.role})</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p>Failed to load group details</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
