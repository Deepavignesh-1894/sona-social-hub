import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { users as usersApi, uploadFile } from '../api';
import './CreatePost.css';

const POST_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'photo', label: 'Photo' },
  { value: 'poll', label: 'Poll' },
];

const POST_CATEGORIES = [
  { value: 'problem', label: 'Problem' },
  { value: 'request', label: 'Request' },
  { value: 'casual', label: 'Casual' },
  { value: 'demand', label: 'Demand' },
  { value: 'other', label: 'Other' },
];

export default function CreatePost({ groupId, groupOfficials, onSuccess, placeholder }) {
  const { user, canPost } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('other');
  const [content, setContent] = useState('');
  const [type, setType] = useState('text');
  const [attachments, setAttachments] = useState([]);
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [taggedOfficials, setTaggedOfficials] = useState([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentionDropdown] = useState(false);
  const [officialsList, setOfficialsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  if (!user || !canPost()) return null;

  const fetchOfficials = async (q) => {
    if (groupId) {
      try {
        const list = await usersApi.groupOfficials(groupId);
        setOfficialsList(list.filter((o) => !q || (o.displayName + ' ' + (o.officialTitle || '') + ' ' + (o.email || '')).toLowerCase().includes(q.toLowerCase())));
      } catch (_) {
        setOfficialsList([]);
      }
    } else {
      try {
        const list = await usersApi.officials(q || '');
        setOfficialsList(list);
      } catch (_) {
        setOfficialsList([]);
      }
    }
  };

  const onMentionInput = (e) => {
    const v = e.target.value;
    setContent(v);
    const match = v.match(/@(\w*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setShowMentionDropdown(true);
      fetchOfficials(match[1]);
    } else {
      setShowMentions(false);
    }
  };

  const pickOfficial = (official) => {
    const name = official.displayName || official.officialTitle || official.email || 'Official';
    setContent((prev) => prev.replace(/@\w*$/, '@' + name + ' '));
    setTaggedOfficials((prev) => (prev.some((o) => o._id === official._id) ? prev : [...prev, official]));
    setShowMentionDropdown(false);
    setMentionQuery('');
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setAttachments((prev) => [...prev, url]);
    } catch (err) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (i) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== i));
  };

  const addPollOption = () => {
    setPollOptions((prev) => [...prev, '']);
  };

  const setPollOption = (i, val) => {
    setPollOptions((prev) => {
      const next = [...prev];
      next[i] = val;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: title.trim(),
      category,
      content: content.trim(),
      type,
      attachments: type === 'photo' ? attachments : [],
      taggedOfficials: taggedOfficials.map((o) => o._id),
      isPublic: !groupId,
    };
    if (groupId) payload.groupId = groupId;
    if (type === 'poll') {
      payload.pollOptions = pollOptions.filter(Boolean);
      if (payload.pollOptions.length < 2) {
        alert('Add at least 2 poll options');
        return;
      }
    }
    setLoading(true);
    try {
      const { posts } = await import('../api');
      await posts.create(payload);
      setTitle('');
      setCategory('other');
      setContent('');
      setAttachments([]);
      setTaggedOfficials([]);
      setPollOptions(['', '']);
      onSuccess?.();
    } catch (err) {
      alert(err.message || 'Post failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post card">
      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="create-post-header">
          <input
            className="input create-post-title"
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
          />
          <select
            className="input create-post-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {POST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <textarea
          className="input create-post-input"
          placeholder={placeholder || 'Share something... Use @ to tag officials'}
          value={content}
          onChange={onMentionInput}
          onBlur={() => setTimeout(() => setShowMentionDropdown(false), 150)}
          rows={3}
        />
        {showMentions && officialsList.length > 0 && (
          <div className="create-post-mentions">
            {officialsList.slice(0, 6).map((o) => (
              <button
                key={o._id}
                type="button"
                className="create-post-mention-item"
                onClick={() => pickOfficial(o)}
              >
                {o.displayName || o.officialTitle || o.email}
              </button>
            ))}
          </div>
        )}
        {type === 'photo' && (
          <div className="create-post-attachments">
            {attachments.map((url, i) => (
              <span key={i} className="create-post-attach-preview">
                <img src={url} alt="" />
                <button type="button" onClick={() => removeAttachment(i)}>×</button>
              </span>
            ))}
            <button
              type="button"
              className="btn btn-ghost create-post-upload"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Uploading…' : '+ Photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
          </div>
        )}
        {type === 'poll' && (
          <div className="create-post-poll">
            {pollOptions.map((opt, i) => (
              <input
                key={i}
                type="text"
                className="input create-post-poll-opt"
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => setPollOption(i, e.target.value)}
              />
            ))}
            <button type="button" className="btn btn-ghost" onClick={addPollOption}>+ Option</button>
          </div>
        )}
        <div className="create-post-bar">
          <div className="create-post-types">
            {POST_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={'create-post-type ' + (type === t.value ? 'active' : '')}
                onClick={() => setType(t.value)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting…' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
