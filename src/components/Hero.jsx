import React from 'react';
import './Hero.css';
import Button from './ui/Button';
import Container from './ui/Container';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';

const Hero = () => {
  const { userSettings } = useAuth();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  return (
    <section className="hero">
      <Container>
        <div className="hero-content">
          <h1 className="hero-title">
            {t.hero.title}
            <span className="gradient-text">{t.hero.titleGradient}</span>
          </h1>
          <p className="hero-subtitle">
            {t.hero.subtitle}
          </p>
          <div className="hero-actions">
            <a href="#analyzer" style={{ textDecoration: 'none' }}>
              <Button size="large">{t.hero.tryBtn}</Button>
            </a>
            <a href="#features" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="large">
                {t.hero.demoBtn}
              </Button>
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">12.4%</span>
              <span className="stat-label">{userSettings?.language === 'en' ? 'Wellness market growth' : 'Рост рынка wellness'}</span>
            </div>
            <div className="stat">
              <span className="stat-number">86%</span>
              <span className="stat-label">{userSettings?.language === 'en' ? 'Dreams regularly' : 'Видят сны регулярно'}</span>
            </div>
            <div className="stat">
              <span className="stat-number">65%</span>
              <span className="stat-label">{userSettings?.language === 'en' ? 'Forget details' : 'Забывают детали'}</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;