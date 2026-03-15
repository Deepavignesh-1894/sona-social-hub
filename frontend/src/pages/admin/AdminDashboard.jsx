import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { admin as adminApi } from '../../api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.dashboard().then(setStats).catch(() => setStats(null)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="admin-page"><div className="admin-loading">Loading…</div></div>;
  if (!stats) return <div className="admin-page"><p>Failed to load dashboard.</p></div>;

  return (
    <div className="admin-page">
      <h1>Admin dashboard</h1>
      <div className="admin-cards">
        <div className="admin-card card">
          <h3>Members</h3>
          <p className="admin-stat">{stats.usersCount}</p>
          <Link to="/app/admin/members" className="admin-link">View all →</Link>
        </div>
        <div className="admin-card card">
          <h3>Groups</h3>
          <p className="admin-stat">{stats.groupsCount}</p>
          <Link to="/app/admin/groups" className="admin-link">View all →</Link>
        </div>
        <div className="admin-card card">
          <h3>Posts</h3>
          <p className="admin-stat">{stats.postsCount}</p>
          <Link to="/app/admin/posts" className="admin-link">View all →</Link>
        </div>
        <Link to="/app/admin/pending" className="admin-card card admin-card-pending">
          <h3>Pending officials</h3>
          <p className="admin-stat">{stats.pendingOfficials}</p>
          <span className="admin-link">Review →</span>
        </Link>
        <Link to="/app/admin/reports" className="admin-card card admin-card-reports">
          <h3>Reports</h3>
          <p className="admin-stat">{stats.reportsCount}</p>
          <span className="admin-link">Review →</span>
        </Link>
      </div>
    </div>
  );
}
