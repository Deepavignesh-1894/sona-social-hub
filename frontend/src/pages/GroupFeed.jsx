import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { posts as postsApi, groups as groupsApi } from '../api';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import GroupChat from '../components/GroupChat';
import './Feed.css';

export default function GroupFeed() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [joining, setJoining] = useState(false);

  const loadGroup = async () => {
    try {
      const g = await groupsApi.get(groupId);
      setGroup(g);
    } catch (e) {
      setGroup(null);
    }
  };

  const loadPosts = async () => {
    try {
      const list = await postsApi.group(groupId);
      setPosts(list);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroup();
    loadPosts();
  }, [groupId]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await groupsApi.join(groupId);
      await loadGroup();
      await loadPosts();
    } catch (e) {
      alert(e.message || 'Failed to join');
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!window.confirm('Leave this group?')) return;
    try {
      await groupsApi.leave(groupId);
      navigate('/app/groups');
    } catch (e) {
      alert(e.message || 'Failed to leave');
    }
  };

  const handleDelete = (id) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  if (!group) {
    return (
      <div className="feed-page">
        <div className="feed-loading">Loading group…</div>
      </div>
    );
  }

  const isMember = group.isMember;
  const canPost = isMember && user;

  return (
    <div className="feed-page">
      <header className="feed-header group-feed-header">
        <div className="feed-back">
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/app/groups')}>
            ← Back to groups
          </button>
        </div>
        <div>
          <h1>{group.name}</h1>
          {group.description && <p>{group.description}</p>}
          <p className="feed-meta">
            Created by {group.createdBy?.displayName || group.createdBy?.email || 'Unknown'}
            {group.createdBy?.officialTitle && ` · ${group.createdBy.officialTitle}`}
          </p>
        </div>
        {user && !group.isMember && (
          <button type="button" className="btn btn-primary" onClick={handleJoin} disabled={joining}>
            {joining ? 'Joining…' : 'Join group'}
          </button>
        )}
        {user && group.isMember && (
          <button type="button" className="btn btn-ghost" onClick={handleLeave}>
            Leave group
          </button>
        )}
      </header>
      {isMember && (
        <div className="group-tabs">
          <button
            type="button"
            className={`group-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            type="button"
            className={`group-tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            Chat
          </button>
        </div>
      )}
      {activeTab === 'posts' && canPost && (
        <CreatePost
          groupId={groupId}
          groupOfficials={[]}
          onSuccess={loadPosts}
          placeholder="Post in this group... Use @ to tag officials"
        />
      )}
      {!isMember && (
        <p className="feed-join-prompt">Join the group to see and create posts.</p>
      )}
      {isMember && activeTab === 'posts' && (
        <>
          {loading ? (
            <div className="feed-loading">Loading…</div>
          ) : posts.length === 0 ? (
            <div className="feed-empty">No posts in this group yet.</div>
          ) : (
            <div className="feed-list">
              {posts.map((post) => (
                <PostCard
                  key={post._id}
                  post={{ ...post, group }}
                  onDelete={handleDelete}
                  onRefresh={loadPosts}
                  isAdmin={user?.role === 'admin'}
                  onOpen={() => navigate(`/app/post/${post._id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
      {isMember && activeTab === 'chat' && (
        <GroupChat groupId={groupId} />
      )}
    </div>
  );
}
