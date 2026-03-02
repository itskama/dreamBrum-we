import React, { useState } from 'react';
import './Header.css';
import Button from './ui/Button';
import Container from './ui/Container';

const Header = ({ isLoggedIn, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="header">
      <Container>
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🌙</span>
            <span className="logo-text">DreamBrum</span>
          </div>

          <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <a href="#features">Возможности</a>
            <a href="#demo">Демо</a>
            <a href="#about">О проекте</a>
          </nav>

          <div className="header-actions">
            {isLoggedIn ? (
              <Button variant="secondary" size="small">
                Личный кабинет
              </Button>
            ) : (
              <Button onClick={onLogin} size="small">
                Войти
              </Button>
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