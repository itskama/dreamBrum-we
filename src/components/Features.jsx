import React from 'react';
import './Features.css';
import Container from './ui/Container';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';

const Features = () => {
  const { userSettings } = useAuth();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  return (
    <section id="features" className="features">
      <Container>
        <h2 className="section-title">{t.features.title}</h2>
        <p className="section-subtitle">
          {t.features.subtitle}
        </p>
        <div className="features-grid">
          {t.features.items.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{['🎤', '🎨', '📊', '🗂️'][index]}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Features;