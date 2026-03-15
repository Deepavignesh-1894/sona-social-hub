import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messages as messagesApi, reports as reportsApi, uploadFile } from '../api';
import './GroupChat.css';

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '👏'];

export default function GroupChat({ groupId }) {
  const { user, canPost } = useAuth();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reactionMenu, setReactionMenu] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    try {
      const list = await messagesApi.list(groupId);
      setMessages(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if ((!content.trim() && attachments.length === 0) || !user || !canPost()) return;
    setLoading(true);
    try {
      const msg = await messagesApi.create(groupId, content.trim(), attachments, replyTo?._id);
      setMessages((prev) => [...prev, msg]);
      setContent('');
      setAttachments([]);
      setReplyTo(null);
      setReactionMenu(null);
    } catch (e) {
      alert(e.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await messagesApi.delete(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      if (url) setAttachments((prev) => [...prev, url]);
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  };

  const handleReact = async (messageId, emoji) => {
    try {
      const res = await messagesApi.react(messageId, emoji);
      setMessages((prev) => prev.map((m) => (m._id === messageId ? { ...m, reactions: res.reactions } : m)));
      setReactionMenu(null);
    } catch (e) {
      alert(e.message || 'React failed');
    }
  };

  const handleReport = async (messageId) => {
    if (!window.confirm('Report this message?')) return;
    const reason = window.prompt('Reason (optional):');
    if (reason === null) return;
    try {
      await reportsApi.create({ targetType: 'message', targetId: messageId, reason: reason || '' });
      alert('Report submitted.');
    } catch (e) {
      alert(e.message || 'Report failed');
    }
  };

  const startReply = (message) => {
    setReplyTo(message);
    setReactionMenu(null);
  };

  const cancelReply = () => setReplyTo(null);


  return (
    <div className="group-chat">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((msg) => {
            const name = msg.author?.displayName || msg.author?.randomName || 'Anonymous';
            const role = msg.author?.role;
            const isOwn = user?._id?.toString() === msg.author?._id?.toString();

            const reactions = msg.reactions || [];
            const reactionCounts = reactions.reduce((acc, r) => {
              acc[r.emoji] = (acc[r.emoji] || 0) + 1;
              return acc;
            }, {});
            const myReactions = reactions.filter((r) => r.user?.toString() === user?._id?.toString()).map((r) => r.emoji);

            return (
              <div
                key={msg._id}
                className={`chat-message ${isOwn ? 'own' : ''} ${role === 'admin' || role === 'official' ? 'highlighted' : ''}`}
                onClick={() => setReactionMenu(null)}
              >
                <div className="chat-message-header">
                  <span className="chat-author">{name}</span>
                  {role === 'admin' && <span className="chat-badge admin-badge">👑</span>}
                  {role === 'official' && <span className="chat-badge official-badge">🏛️</span>}
                  <span className="chat-time">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                  {(isOwn || user?.role === 'admin') && (
                    <button
                      type="button"
                      className="chat-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(msg._id);
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                {msg.replyTo && (
                  <div className="chat-reply">
                    <span className="chat-reply-author">Replying to {msg.replyTo.author?.displayName || msg.replyTo.author?.randomName || 'Unknown'}:</span>
                    <span className="chat-reply-content">{msg.replyTo.content}</span>
                  </div>
                )}
                {msg.content && <p className="chat-content">{msg.content}</p>}
                {msg.attachments?.length > 0 && (
                  <div className="chat-attachments">
                    {msg.attachments.map((url) => (
                      <a key={url} href={url} target="_blank" rel="noreferrer" className="chat-attachment">
                        {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                          <img src={url} alt="attachment" />
                        ) : url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video src={url} controls />
                        ) : (
                          <span>{url.split('/').pop()}</span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
                {Object.keys(reactionCounts).length > 0 && (
                  <div className="chat-reactions">
                    {Object.entries(reactionCounts).map(([emoji, count]) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`chat-reaction ${myReactions.includes(emoji) ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReact(msg._id, emoji);
                        }}
                      >
                        {emoji} {count}
                      </button>
                    ))}
                  </div>
                )}
                <div className="chat-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      startReply(msg);
                    }}
                  >
                    Reply
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setReactionMenu((prev) => (prev === msg._id ? null : msg._id));
                    }}
                  >
                    React
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReport(msg._id);
                    }}
                  >
                    Report
                  </button>
                </div>
                {reactionMenu === msg._id && (
                  <div className="reaction-menu">
                    {REACTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className="reaction-item"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReact(msg._id, emoji);
                        }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      {user && canPost() && (
        <form onSubmit={handleSubmit} className="chat-form">
          {replyTo && (
            <div className="chat-reply-preview">
              Replying to <strong>{replyTo.author?.displayName || replyTo.author?.randomName}</strong>: "{replyTo.content?.slice(0, 120)}"
              <button type="button" className="btn btn-ghost" onClick={cancelReply}>×</button>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="chat-attachments-preview">
              {attachments.map((url, idx) => (
                <div key={url + idx} className="chat-attachment-preview">
                  <a href={url} target="_blank" rel="noreferrer">
                    {url.split('/').pop()}
                  </a>
                  <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}>×</button>
                </div>
              ))}
            </div>
          )}
          <div className="chat-form-row">
            <input
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />
            <button
              type="button"
              className="btn btn-ghost chat-attach"
              onClick={() => fileInputRef.current?.click()}
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            <button type="submit" className="btn btn-primary chat-send" disabled={loading || (!content.trim() && attachments.length === 0)}>
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}