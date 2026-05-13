import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';

const Header: React.FC = () => {
  const { currentUser, userSettings, updateSettings, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  const toggleLanguage = () => {
    const newLang = userSettings?.language === 'ru' ? 'en' : 'ru';
    updateSettings({ language: newLang });
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container header-flex">
        <Link to="/" className="logo">
          DreamBrum
        </Link>
        
        <nav className="nav-links">
          {currentUser ? (
            <div className="profile-container">
              <button 
                className="profile-btn" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {currentUser.email?.split('@')[0]} ▾
              </button>
              {isDropdownOpen && (
                <div className="dropdown">
                  <Link to="/library" onClick={() => setIsDropdownOpen(false)}>{t.nav.myDreams}</Link>
                  <Link to="/cabinet" onClick={() => setIsDropdownOpen(false)}>{t.nav.cabinet}</Link>
                  <button onClick={handleLogout} className="logout-item">{t.nav.logout}</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link">{t.nav.login}</Link>
          )}
          <button className="lang-pill" onClick={toggleLanguage}>
            {userSettings?.language === 'ru' ? 'RU' : 'EN'}
          </button>
        </nav>
      </div>

      <style>{`
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          display: flex;
          align-items: center;
          background-color: rgba(46, 58, 78, 0.85);
          backdrop-filter: blur(12px);
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.6rem;
          font-weight: 800;
          color: white;
          text-decoration: none;
          letter-spacing: -0.8px;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .profile-container {
          position: relative;
        }

        .profile-btn {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          padding: 8px 16px;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .profile-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          background-color: var(--card-color);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.4);
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dropdown a, .logout-item {
          color: var(--text-dark);
          text-decoration: none;
          padding: 12px 16px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          text-align: left;
          background: none;
          transition: background 0.2s;
        }

        .dropdown a:hover {
          background-color: rgba(45, 79, 138, 0.1);
          color: var(--blue);
        }

        .logout-item {
          color: #d32f2f;
          border-top: 1px solid rgba(0,0,0,0.05);
          margin-top: 4px;
          padding-top: 14px;
        }

        .logout-item:hover {
          background-color: rgba(211, 47, 47, 0.05);
        }

        .lang-pill {
          background: var(--purple);
          color: white;
          font-weight: 700;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(107, 58, 138, 0.3);
        }

        .login-link {
          color: white;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.95rem;
        }
      `}</style>
    </header>
  );
};

export default Header;
