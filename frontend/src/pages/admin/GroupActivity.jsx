import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function GroupActivity() {
  const { groupId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');

  useEffect(() => {
    if (groupId) {
      adminApi.groupActivity(groupId)
        .then(setData)
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    }
  }, [groupId]);

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;
  if (!data) return <div className="admin-page"><div className="admin-error">Failed to load group activity</div></div>;

  const { group, posts, messages, members } = data;

  return (
    <div className="admin-page">
      <h1>Group Activity: {group.name}</h1>
      <div className="admin-group-info">
        <p><strong>Created by:</strong> {group.createdBy?.displayName || group.createdBy?.email}</p>
        <p><strong>Members:</strong> {members.length}</p>
        <p><strong>Posts:</strong> {posts.length}</p>
        <p><strong>Messages:</strong> {messages.length}</p>
      </div>

      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => setActiveTab('posts')}
        >
          Posts ({posts.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages ({messages.length})
        </button>
        <button
          className={`admin-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members ({members.length})
        </button>
      </div>

      <div className="admin-tab-content">
        {activeTab === 'posts' && (
          <div className="admin-posts-list">
            {posts.length === 0 ? (
              <p>No posts in this group.</p>
            ) : (
              posts.map((post) => (
                <div key={post._id} className="admin-post-item">
                  <div className="admin-post-header">
                    <span className="admin-post-author">
                      {post.author?.role === 'official' ? post.author.displayName : post.author?.randomName || post.author?.displayName}
                    </span>
                    <span className="admin-post-time">
                      {new Date(post.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="admin-post-content">
                    {post.content && <p>{post.content}</p>}
                    {post.attachments?.length > 0 && (
                      <div className="admin-post-attachments">
                        {post.attachments.length} attachment(s)
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="admin-messages-list">
            {messages.length === 0 ? (
              <p>No messages in this group.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg._id} className="admin-message-item">
                  <div className="admin-message-header">
                    <span className="admin-message-author">
                      {msg.author?.role === 'official' ? msg.author.displayName : msg.author?.randomName || msg.author?.displayName}
                    </span>
                    <span className="admin-message-time">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="admin-message-content">
                    {msg.content && <p>{msg.content}</p>}
                    {msg.attachments?.length > 0 && (
                      <div className="admin-message-attachments">
                        {msg.attachments.length} attachment(s)
                      </div>
                    )}
                    {msg.replyTo && (
                      <div className="admin-message-reply">
                        Replying to: {msg.replyTo.content?.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member._id}>
                    <td>{member.role === 'official' ? member.displayName : member.randomName || member.displayName}</td>
                    <td>{member.email}</td>
                    <td>{member.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}