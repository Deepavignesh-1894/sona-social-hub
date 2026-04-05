import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messages as messagesApi, reports as reportsApi, uploadFile, users } from '../api';
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
  const [officials, setOfficials] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const isUserScrollingRef = useRef(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const list = await messagesApi.list(groupId);
        setMessages(list);
      } catch (e) {
        console.error(e);
      }
    };

    const loadOfficials = async () => {
      try {
        const list = await users.groupOfficials(groupId);
        setOfficials(list);
      } catch (e) {
        console.error(e);
      }
    };

    loadMessages();
    loadOfficials();

    // Poll for new messages every 2 seconds
    const messageInterval = setInterval(loadMessages, 2000);

    // Cleanup interval on component unmount or groupId change
    return () => clearInterval(messageInterval);
  }, [groupId]);

  // Only scroll to bottom when NEW messages arrive, not on every poll
  useEffect(() => {
    // Check if new messages were added
    if (messages.length > previousMessageCountRef.current && !isUserScrollingRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  // Track when user is scrolling
  const handleScroll = (e) => {
    const container = e.target;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    isUserScrollingRef.current = !isAtBottom;
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setContent(value);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1 && (atIndex === 0 || textBeforeCursor[atIndex - 1] === ' ' || textBeforeCursor[atIndex - 1] === '\n')) {
      const query = textBeforeCursor.substring(atIndex + 1);
      if (query.length === 0 || !query.includes(' ')) {
        setMentionQuery(query.toLowerCase());
        setShowMentions(true);
        setMentionIndex(-1);
        return;
      }
    }
    
    setShowMentions(false);
    setMentionQuery('');
  };

  const selectMention = (official) => {
    const cursorPos = inputRef.current.selectionStart;
    const textBeforeCursor = content.substring(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atIndex !== -1) {
      const beforeAt = content.substring(0, atIndex);
      const afterCursor = content.substring(cursorPos);
      const newContent = `${beforeAt}@${official.displayName}${afterCursor}`;
      setContent(newContent);
      setShowMentions(false);
      
      // Set cursor position after the mention
      setTimeout(() => {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(atIndex + official.displayName.length + 1, atIndex + official.displayName.length + 1);
      }, 0);
    }
  };

  const handleKeyDown = (e) => {
    if (showMentions && officials.length > 0) {
      const filtered = officials.filter(o => 
        o.displayName.toLowerCase().includes(mentionQuery) ||
        (o.officialTitle && o.officialTitle.toLowerCase().includes(mentionQuery))
      );
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setMentionIndex(prev => prev < filtered.length - 1 ? prev + 1 : 0);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setMentionIndex(prev => prev > 0 ? prev - 1 : filtered.length - 1);
      } else if (e.key === 'Enter' && mentionIndex >= 0) {
        e.preventDefault();
        selectMention(filtered[mentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
    }
  };

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

  const toggleMessageActions = (messageId) => {
    setExpandedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleMessageMouseEnter = () => {
    // Could auto-expand on hover, but for now we'll use click
  };

  const handleMessageMouseLeave = () => {
    // Could auto-collapse on mouse leave
  };


  const formatMessageDateTime = (date) => {
    const d = new Date(date);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    return `${month} ${day} ${year} ${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="group-chat">
      <div className="chat-messages" onScroll={handleScroll}>
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
                onMouseEnter={handleMessageMouseEnter}
                onMouseLeave={handleMessageMouseLeave}
              >
                <div className="chat-message-header">
                  <span className="chat-author">{name}</span>
                  {role === 'admin' && <span className="chat-badge admin-badge">👑</span>}
                  {role === 'official' && <span className="chat-badge official-badge">🏛️</span>}
                  <span className="chat-time">{formatMessageDateTime(msg.createdAt)}</span>
                  <button
                    type="button"
                    className="chat-expand-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMessageActions(msg._id);
                    }}
                    title="Show actions"
                  >
                    {expandedMessages.has(msg._id) ? '▼' : '▶'}
                  </button>
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
                        {url.match(/\.(jpg|jpeg|png)$/i) ? (
                          <img src={url} alt="attachment" />
                        ) : url.match(/\.pdf$/i) ? (
                          <span>📄 {url.split('/').pop()}</span>
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
                {expandedMessages.has(msg._id) && (
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
                )}
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
            <div className="chat-input-container">
              <input
                ref={inputRef}
                type="text"
                className="chat-input"
                placeholder="Type a message... @ to mention officials"
                value={content}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                maxLength={500}
              />
              {showMentions && officials.length > 0 && (
                <div className="mention-dropdown">
                  {officials
                    .filter(o => 
                      o.displayName.toLowerCase().includes(mentionQuery) ||
                      (o.officialTitle && o.officialTitle.toLowerCase().includes(mentionQuery))
                    )
                    .slice(0, 5)
                    .map((official, idx) => (
                      <div
                        key={official._id}
                        className={`mention-item ${idx === mentionIndex ? 'active' : ''}`}
                        onClick={() => selectMention(official)}
                      >
                        <div className="mention-name">{official.displayName}</div>
                        <div className="mention-title">{official.officialTitle}</div>
                      </div>
                    ))}
                </div>
              )}
            </div>
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