import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { translations } from '../translations';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, userSettings } = useAuth();
  const navigate = useNavigate();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/cabinet');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <h2 className="login-title">{t.auth.welcomeBack}</h2>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">{t.auth.email}</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">{t.auth.password}</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn-purple" type="submit" disabled={loading}>
            {loading && <span className="spinner"></span>}
            {t.auth.loginBtn}
          </button>
        </form>

        <p className="toggle-auth-text">
          {t.auth.dontHaveAccount} <Link to="/register">{t.auth.signupLink}</Link>
        </p>
      </div>

      <style>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: var(--bg-color);
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          animation: slideUp 0.5s ease-out;
        }

        .login-title {
          font-size: 2rem;
          margin-bottom: 32px;
          text-align: center;
          color: var(--text-dark);
          font-weight: 700;
        }

        .error-message {
          background-color: rgba(201, 138, 160, 0.2);
          color: #d32f2f;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 0.9rem;
          text-align: center;
          border: 1px solid var(--rose);
          font-weight: 500;
        }

        .input-group {
          margin-bottom: 24px;
        }

        .input-group label {
          color: var(--text-dark);
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .input-group input {
          background-color: white;
          border: 1px solid rgba(0,0,0,0.1);
          color: var(--text-dark);
        }

        .toggle-auth-text {
          margin-top: 32px;
          text-align: center;
          font-size: 0.95rem;
          color: var(--text-dark);
        }

        .toggle-auth-text a {
          color: var(--purple);
          font-weight: 700;
          text-decoration: none;
        }

        .toggle-auth-text a:hover {
          text-decoration: underline;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Login;
