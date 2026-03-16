import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { comments as commentsApi, reports } from '../api';
import './CommentSection.css';

export default function CommentSection({ postId, onCountChange, isAdmin }) {
  const { user, canPost } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await commentsApi.list(postId);
        setComments(list);
        onCountChange?.(list.length);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [postId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !user || !canPost()) return;
    setLoading(true);
    try {
      const c = await commentsApi.create(postId, content.trim());
      setComments((prev) => [...prev, c]);
      setContent('');
      onCountChange?.(comments.length + 1);
    } catch (e) {
      alert(e.message || 'Failed to post comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await commentsApi.delete(id);
      setComments((prev) => prev.filter((c) => c._id !== id));
      onCountChange?.(comments.length - 1);
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const handleReport = async (commentId) => {
    if (!user || !canPost()) return;
    const reason = window.prompt('Reason (optional):');
    if (reason === null) return;
    try {
      await reports.create({ targetType: 'comment', targetId: commentId, reason: reason || '' });
      alert('Report submitted.');
    } catch (e) {
      alert(e.message || 'Report failed');
    }
  };

  return (
    <div className="comment-section">
      {user && canPost() && (
        <form onSubmit={handleSubmit} className="comment-form">
          <textarea
            className="input comment-input"
            placeholder="Write a comment…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn btn-primary comment-submit" disabled={loading || !content.trim()}>
            {loading ? 'Posting…' : 'Comment'}
          </button>
        </form>
      )}
      <ul className="comment-list">
        {comments.map((c) => {
          const name = c.author?.randomName || c.author?.displayName || (c.author?.role === 'official' ? c.author?.officialTitle || 'Official' : 'Anonymous');
          const role = c.author?.role;
          return (
            <li key={c._id} className={`comment-item ${role === 'admin' || role === 'official' ? 'comment-highlighted' : ''}`}>
              <div className="comment-item-header">
                <span className="comment-author">{name}</span>
                {role === 'admin' && <span className="comment-badge admin-badge">👑</span>}
                {role === 'official' && <span className="comment-badge official-badge">🏛️</span>}
                {(user?._id === c.author?._id || isAdmin) && (
                  <button type="button" className="comment-delete" onClick={() => handleDelete(c._id)}>🗑️</button>
                )}
                {user && canPost() && user?._id !== c.author?._id && (
                  <button type="button" className="comment-report" onClick={() => handleReport(c._id)}>Report</button>
                )}
              </div>
              <p className="comment-content">{c.content}</p>
              <span className="comment-meta">{new Date(c.createdAt).toLocaleString()}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
