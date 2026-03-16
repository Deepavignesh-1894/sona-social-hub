import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Sidebar.css';

export default function Sidebar({ currentGroup, onJoinGroup }) {
  const { user, logout, canCreateGroup } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';
  const isOfficial = user?.role === 'official';
  const pending = isOfficial && !user?.isOfficialApproved;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <NavLink to="/app" className="sidebar-logo">Sona Social Hub</NavLink>
        <p className="sidebar-tagline">Sona College of Technology</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/app" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <span className="icon">📰</span> Public feed
        </NavLink>
        <NavLink to="/app/groups" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <span className="icon">👥</span> My groups
        </NavLink>
        <NavLink to="/app/join-group" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <span className="icon">➕</span> Join a group
        </NavLink>
        {canCreateGroup() && (
          <NavLink to="/app/create-group" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
            <span className="icon">🆕</span> Create group
          </NavLink>
        )}
        <NavLink to="/app/profile" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
          <span className="icon">👤</span> Edit profile
        </NavLink>
        {isAdmin && (
          <>
            <div className="sidebar-divider" />
            <NavLink to="/app/admin" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">📊</span> Dashboard
            </NavLink>
            <NavLink to="/app/admin/pending" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">✅</span> Pending officials
            </NavLink>
            <NavLink to="/app/admin/members" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">👥</span> All members
            </NavLink>
            <NavLink to="/app/admin/groups" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">📁</span> All groups
            </NavLink>
            <NavLink to="/app/admin/posts" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">📝</span> All posts
            </NavLink>
            <NavLink to="/app/admin/reports" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              <span className="icon">🚩</span> Reports
            </NavLink>
          </>
        )}
      </nav>
      <div className="sidebar-footer">
        {pending && (
          <p className="sidebar-pending">⏳ Pending approval — view only</p>
        )}
        <div className="sidebar-profile">
          <div className="sidebar-profile-info">
            <div className="sidebar-profile-name">
              {user?.role === 'official' ? user?.displayName : user?.randomName || user?.displayName}
            </div>
            <div className="sidebar-profile-role">
              {user?.role === 'admin' && '👑 Admin'}
              {user?.role === 'official' && `🏛️ ${user?.officialTitle || 'Official'}`}
              {user?.role === 'student' && '🎓 Student'}
            </div>
            {user?.role === 'admin' && (
              <div className="sidebar-profile-email">{user?.email}</div>
            )}
          </div>
        </div>
        <button type="button" className="theme-toggle sidebar-theme" onClick={toggle} aria-label="Toggle theme">
          {dark ? '☀️' : '🌙'}
        </button>
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          Log out
        </button>
      </div>
    </aside>
  );
}
