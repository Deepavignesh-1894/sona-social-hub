import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api';
import PostCard from '../../components/PostCard';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AllPosts() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.allPosts().then(setList).catch(() => setList([])).finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => {
    setList((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;

  return (
    <div className="admin-page">
      <h1>All posts</h1>
      <p className="admin-sub">Admin view: author emails are visible. You can delete any post.</p>
      {list.length === 0 ? (
        <p className="admin-empty">No posts.</p>
      ) : (
        <div className="admin-posts">
          {list.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={handleDelete}
              onRefresh={() => adminApi.allPosts().then(setList)}
              isAdmin
            />
          ))}
        </div>
      )}
    </div>
  );
}
