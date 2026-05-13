import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { userSettings } = useAuth();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  const scrollToFeatures = () => {
    const features = document.getElementById('features');
    if (features) {
      features.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-page">
      <section className="hero">
        <div className="container hero-content">
          <h1 className="hero-title">{t.landing.heroTitle}</h1>
          <p className="hero-subtitle">{t.landing.heroSubtitle}</p>
          <div className="hero-buttons">
            <button className="btn-purple" onClick={() => navigate('/login')}>
              {t.landing.tryFree}
            </button>
            <button className="btn-outline" onClick={scrollToFeatures}>
              {t.landing.watchDemo}
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title text-center">{t.landing.keyFeatures}</h2>
          <div className="features-grid">
            {t.landing.features.map((feature: any, index: number) => (
              <div key={index} className="feature-card card">
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .landing-page {
          background-color: var(--bg-color);
        }

        .hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top right, #6B3A8A 0%, #2E3A4E 50%);
          position: relative;
        }

        .hero-title {
          font-size: clamp(2.5rem, 8vw, 4.5rem);
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 24px;
          background: linear-gradient(to bottom, #FFFFFF, #C98AA0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeIn 1s ease-out;
        }

        .hero-subtitle {
          font-size: clamp(1.1rem, 3vw, 1.4rem);
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 40px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
          animation: fadeIn 1.2s ease-out;
        }
        .hero-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          animation: fadeIn 1.4s ease-out;
        }

        .hero-buttons button {
          padding: 16px 40px;
          font-size: 1.1rem;
          font-weight: 700;
          min-width: 200px;
        }

        .features {
          padding: 120px 0;
          background-color: var(--bg-color);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 60px;
          color: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .feature-card {
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          padding: 40px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .feature-title {
          color: var(--text-dark);
          font-size: 1.5rem;
          font-weight: 700;
        }

        .feature-description {
          color: var(--text-dark);
          opacity: 0.8;
          line-height: 1.6;
        }

        .text-center { text-align: center; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 375px) {
          .hero-buttons {
            flex-direction: column;
            width: 100%;
          }
          .hero-buttons button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Landing;
