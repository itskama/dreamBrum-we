import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Button from './ui/Button';
import Container from './ui/Container';
import { translations } from '../translations';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userSettings } = useAuth();

  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  return (
    <header className="header">
      <Container>
        <div className="header-content">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-icon">🌙</span>
            <span className="logo-text">DreamBrum</span>
          </Link>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/">{t.nav.home}</Link>
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <Link to="/cabinet" style={{ 
                fontSize: '14px', 
                color: 'var(--text-secondary)', 
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {currentUser.email}
              </Link>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button size="small">
                  {t.nav.login}
                </Button>
              </Link>
            )}
          </div>

          <button 
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Меню"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </Container>
    </header>
  );
};

export default Header;