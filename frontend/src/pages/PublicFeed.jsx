import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { posts as postsApi } from '../api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import EmailVerificationBanner from '../components/EmailVerificationBanner';
import './Feed.css';

export default function PublicFeed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const list = await postsApi.public();
      setPosts(list);
    } catch (e) {
      console.error(e);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  return (
    <div className="feed-page">
      <header className="feed-header">
        <h1>Public feed</h1>
        <p>Posts from everyone at Sona College of Technology</p>
      </header>
      {user && <EmailVerificationBanner user={user} />}
      {user && <CreatePost onSuccess={load} placeholder="Share with the campus... Use @ to tag officials" />}
      {loading ? (
        <div className="feed-loading">Loading…</div>
      ) : posts.length === 0 ? (
        <div className="feed-empty">No posts yet. Be the first to post!</div>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onRefresh={load}
              isAdmin={user?.role === 'admin'}
            />
          ))}
        </div>
      )}
    </div>
  );
}
