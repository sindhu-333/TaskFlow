import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <div className="nav-logo-icon">✓</div>
        <span>TaskFlow</span>
      </div>
      <div className="nav-right">
        <div className="user-badge">
          <div className="user-avatar">{initials}</div>
          <span style={{ display: 'none' }}>{user?.name}</span>
        </div>
        <button className="btn btn-ghost" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
