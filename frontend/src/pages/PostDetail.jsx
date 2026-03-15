import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { posts as postsApi } from '../api';
import PostCard from '../components/PostCard';
import './Feed.css';

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadPost = async () => {
    setLoading(true);
    try {
      const p = await postsApi.get(postId);
      setPost(p);
    } catch (e) {
      console.error(e);
      setPost(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  return (
    <div className="feed-page">
      <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {loading ? (
        <div className="feed-loading">Loading…</div>
      ) : !post ? (
        <div className="feed-empty">Post not found.</div>
      ) : (
        <PostCard
          post={post}
          onRefresh={loadPost}
          isAdmin={user?.role === 'admin'}
        />
      )}
    </div>
  );
}
