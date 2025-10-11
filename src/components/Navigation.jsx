import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/components/navigation.css';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', name: 'Explore' },
    { path: '/create', name: 'Create' },
    { path: '/statistics', name: 'Statistics' },
    { path: '/signin', name: 'Sign In' }
  ];

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="nav-logo">
          <img src="/src/assets/logos/breach_logo_white.png" alt="Breach Logo" className="logo-img" />
        </Link>
      </div>
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <Link
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;
