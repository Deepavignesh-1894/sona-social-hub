import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import './Landing.css';

export default function Landing() {
  const { dark, toggle } = useTheme();

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-brand">
          <span className="landing-logo">Sona Social Hub</span>
          <p className="landing-tagline">Sona College of Technology — Anonymous Campus Community</p>
        </div>
        <div className="landing-actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            title={dark ? 'Switch to light' : 'Switch to dark'}
            aria-label="Toggle theme"
          >
            {dark ? '☀️' : '🌙'}
          </button>
          <Link to="/login" className="btn btn-ghost">Log in</Link>
          <Link to="/register" className="btn btn-primary">Get started</Link>
        </div>
      </header>
      <main className="landing-hero">
        <h1>Your voice, your community</h1>
        <p>Share, discuss, and connect anonymously with students and faculty at Sona College of Technology. Public feed, groups, polls, and more.</p>
        <div className="landing-cta">
          <Link to="/register" className="btn btn-primary btn-lg">Join now</Link>
          <Link to="/login" className="btn btn-ghost btn-lg">Sign in</Link>
        </div>
      </main>
      <footer className="landing-footer">
        <p>© Sona Social Hub — Sona College of Technology. Use only with @sonatech.ac.in</p>
      </footer>
    </div>
  );
}
