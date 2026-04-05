import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';
import Button from './ui/Button';
import Container from './ui/Container';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser } = useAuth();

  return (
    <header className="header">
      <Container>
        <div className="header-content">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
            <span className="logo-icon">🌙</span>
            <span className="logo-text">DreamBrum</span>
          </Link>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/">Главная</Link>
            {currentUser && <Link to="/cabinet">Личный кабинет</Link>}
            {currentUser && <Link to="/admin">Админ-панель</Link>}
          </nav>

          <div className="header-actions">
            {currentUser ? (
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                {currentUser.email}
              </span>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button size="small">
                  Войти
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