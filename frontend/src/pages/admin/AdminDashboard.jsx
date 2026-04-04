import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;
  if (!stats) return <div className="admin-page"><p>Failed to load dashboard.</p></div>;

  return (
    <div className="admin-page">
      <h1>Admin Dashboard</h1>
      
      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>👥 Users & Verification</h2>
      <div className="admin-cards">
        <div className="admin-card card">
          <h3>Total Members</h3>
          <p className="admin-stat">{stats.users.total}</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
            ✅ Verified: {stats.users.verified}<br/>
            ⏳ Unverified: {stats.users.unverified}
          </p>
          <div className="admin-links">
            <Link to="/app/admin/members-detailed" className="admin-link">View all →</Link>
            <Link to="/app/admin/members-detailed" className="admin-link">Unverified →</Link>
          </div>
        </div>

        <div className="admin-card card">
          <h3>Officials</h3>
          <p className="admin-stat">{stats.users.officials}</p>
          <Link to="/app/admin/pending" className="admin-link">Approve requests →</Link>
        </div>

        <div className="admin-card card">
          <h3>Banned Users</h3>
          <p className="admin-stat">{stats.users.banned}</p>
          <Link to="/app/admin/members-detailed" className="admin-link">View banned →</Link>
        </div>

        <div className="admin-card card">
          <h3>Joined Today</h3>
          <p className="admin-stat">{stats.users.joinedToday}</p>
          <Link to="/app/admin/members-detailed" className="admin-link">View recent →</Link>
        </div>
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>📱 Content</h2>
      <div className="admin-cards">
        <div className="admin-card card">
          <h3>Posts</h3>
          <p className="admin-stat">{stats.content.posts}</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
            Today: {stats.content.postsToday}
          </p>
          <Link to="/app/admin/posts" className="admin-link">View all →</Link>
        </div>

        <div className="admin-card card">
          <h3>Comments</h3>
          <p className="admin-stat">{stats.content.comments}</p>
          <Link to="/app/admin/posts" className="admin-link">Manage →</Link>
        </div>

        <div className="admin-card card">
          <h3>Groups</h3>
          <p className="admin-stat">{stats.content.groups}</p>
          <Link to="/app/admin/groups" className="admin-link">View all →</Link>
        </div>

        <div className="admin-card card">
          <h3>Messages</h3>
          <p className="admin-stat">{stats.content.messages}</p>
          <Link to="/app/admin/groups" className="admin-link">Manage groups →</Link>
        </div>
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>⚠️ Moderation</h2>
      <div className="admin-cards">
        <Link to="/app/admin/reports" className="admin-card card admin-card-reports">
          <h3>Reports</h3>
          <p className="admin-stat" style={{ color: '#d32f2f' }}>Review</p>
          <span className="admin-link">Handle reports →</span>
        </Link>

        <div className="admin-card card" style={{ backgroundColor: '#f3e5f5' }}>
          <h3>Admins</h3>
          <p className="admin-stat">{stats.users.admins}</p>
          <p style={{ fontSize: '12px', color: '#666', margin: '5px 0' }}>
            Super users
          </p>
        </div>
      </div>

      <h2 style={{ marginTop: '30px', marginBottom: '15px' }}>🔧 Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <Link to="/app/admin/users" style={{ 
          padding: '15px', 
          backgroundColor: '#e8f5e9', 
          textAlign: 'center', 
          borderRadius: '5px',
          textDecoration: 'none',
          color: '#2e7d32',
          fontWeight: 'bold'
        }}>
          👥 Manage Users
        </Link>
        <Link to="/app/admin/pending" style={{ 
          padding: '15px', 
          backgroundColor: '#e3f2fd', 
          textAlign: 'center', 
          borderRadius: '5px',
          textDecoration: 'none',
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          👔 Approve Officials
        </Link>
        <Link to="/app/admin/members-detailed" style={{ 
          padding: '15px', 
          backgroundColor: '#fce4ec', 
          textAlign: 'center', 
          borderRadius: '5px',
          textDecoration: 'none',
          color: '#c2185b',
          fontWeight: 'bold'
        }}>
          🔍 Verify Emails
        </Link>
        <Link to="/app/admin/posts" style={{ 
          padding: '15px', 
          backgroundColor: '#fff3e0', 
          textAlign: 'center', 
          borderRadius: '5px',
          textDecoration: 'none',
          color: '#f57c00',
          fontWeight: 'bold'
        }}>
          🗑️ Manage Posts
        </Link>
        <Link to="/app/admin/reports" style={{ 
          padding: '15px', 
          backgroundColor: '#ffebee', 
          textAlign: 'center', 
          borderRadius: '5px',
          textDecoration: 'none',
          color: '#d32f2f',
          fontWeight: 'bold'
        }}>
          ⚖️ Handle Reports
        </Link>
      </div>
    </div>
  );
}
