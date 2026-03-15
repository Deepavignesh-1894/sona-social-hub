import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { comments as commentsApi, posts as postsApi, reports } from '../api';
import CommentSection from './CommentSection';
import './PostCard.css';

export default function PostCard({ post, onDelete, onRefresh, isAdmin, onOpen }) {
  const { user, canPost } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likeCount ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [pollVoted, setPollVoted] = useState(false);

  useEffect(() => {
    setLikeCount(post.likeCount ?? 0);
    setLiked(Array.isArray(post.likes) && post.likes.some((id) => id?.toString?.() === user?._id?.toString?.()));
  }, [post, user?._id]);

  const authorRole = post.author?.role;
  const authorName = post.author?.role === 'official'
    ? post.author?.displayName
    : post.author?.randomName || post.author?.displayName || 'Anonymous';
  const authorSub = post.author?.role === 'official' ? post.author?.email : null;
  const isMine = user?._id === post.author?._id;

  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await postsApi.like(post._id);
      setLikeCount(res.likeCount);
      setLiked(res.liked);
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
  };

  const loadCommentCount = async () => {
    try {
      const list = await commentsApi.list(post._id);
      setCommentCount(list.length);
    } catch (_) {}
  };

  useEffect(() => {
    if (showComments) loadCommentCount();
  }, [showComments, post._id]);

  const handlePollVote = async (optionIndex) => {
    if (!user || pollVoted) return;
    try {
      await postsApi.pollVote(post._id, optionIndex);
      setPollVoted(true);
      onRefresh?.();
    } catch (e) {
      console.error(e);
    }
  };

  const handleReport = async () => {
    if (!user || !canPost()) return;
    const reason = window.prompt('Reason for report (optional):');
    if (reason === null) return;
    try {
      await reports.create({ targetType: 'post', targetId: post._id, reason: reason || '' });
      alert('Report submitted.');
    } catch (e) {
      alert(e.message || 'Report failed');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await postsApi.delete(post._id);
      onDelete?.(post._id);
      onRefresh?.();
    } catch (e) {
      alert(e.message || 'Delete failed');
    }
  };

  const totalVotes = post.pollOptions?.reduce((s, o) => s + (o.votes?.length ?? 0), 0) ?? 0;

  return (
    <article className={`post-card card ${authorRole === 'admin' || authorRole === 'official' ? 'highlighted' : ''} ${isMine ? 'my-post' : ''}`} onClick={() => onOpen?.()}>

      <div className="post-card-header">
        <div className="post-card-author">
          <div className="post-card-avatar">
            {post.author?.avatar ? (
              <img src={post.author.avatar} alt="" />
            ) : (
              <span>{authorName.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div>
            <span className="post-card-name">{authorName}</span>
            {authorRole === 'admin' && <span className="post-card-badge admin-badge">👑 Admin</span>}
            {authorRole === 'official' && <span className="post-card-badge official-badge">🏛️ Official</span>}
            {post.category && <span className="post-card-badge category-badge">{post.category}</span>}
            {authorSub && (isAdmin || post.author?.email) && (
              <span className="post-card-email"> {post.author?.email}</span>
            )}
            {post.title && <div className="post-card-title">{post.title}</div>}
            <div className="post-card-meta">
              {post.createdAt && new Date(post.createdAt).toLocaleString()}
              {post.group && <span className="post-card-group"> · {post.group?.name || 'Group'}</span>}
              {commentCount > 0 && <span className="post-card-comments"> · {commentCount} comments</span>}
            </div>
          </div>
        </div>
        {(user?._id === post.author?._id || user?.role === 'admin') && (
          <button
            type="button"
            className="post-card-delete"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Delete"
          >
            Delete
          </button>
        )}
      </div>
      {post.content && <div className="post-card-content">{post.content}</div>}
      {post.attachments?.length > 0 && (
        <div className="post-card-attachments">
          {post.attachments.map((url, i) => (
            <img key={i} src={url.startsWith('http') ? url : url} alt="" className="post-card-img" />
          ))}
        </div>
      )}
      {post.type === 'poll' && post.pollOptions?.length > 0 && (
        <div className="post-card-poll">
          {post.pollOptions.map((opt, i) => (
            <button
              key={i}
              type="button"
              className="post-card-poll-opt"
              onClick={() => handlePollVote(i)}
              disabled={pollVoted}
            >
              <span>{opt.text}</span>
              <span className="post-card-poll-count">
                {opt.votes?.length ?? 0}
                {totalVotes > 0 && ' (' + Math.round(((opt.votes?.length ?? 0) / totalVotes) * 100) + '%)'}
              </span>
            </button>
          ))}
        </div>
      )}
      {post.taggedOfficials?.length > 0 && (
        <div className="post-card-tagged">
          Tagged: {post.taggedOfficials.map((o) => o.displayName || o.officialTitle || o.email).join(', ')}
        </div>
      )}
      <div className="post-card-actions">
        <button
          type="button"
          className={'post-card-like ' + (liked ? 'liked' : '')}
          onClick={(e) => {
            e.stopPropagation();
            handleLike();
          }}
        >
          Like {likeCount}
        </button>
        <button
          type="button"
          className="post-card-comment-btn"
          onClick={(e) => {
            e.stopPropagation();
            setShowComments((s) => !s);
          }}
        >
          Comments {showComments ? 'Hide' : ''} {commentCount > 0 ? '(' + commentCount + ')' : ''}
        </button>
        {user && canPost() && (
          <button
            type="button"
            className="post-card-report"
            onClick={(e) => {
              e.stopPropagation();
              handleReport();
            }}
          >
            Report
          </button>
        )}
      </div>
      {showComments && (
        <CommentSection
          postId={post._id}
          onCountChange={setCommentCount}
          isAdmin={isAdmin}
        />
      )}
    </article>
  );
}
