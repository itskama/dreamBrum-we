import React from 'react';
import './Hero.css';
import Button from './ui/Button';
import Container from './ui/Container';

const Hero = () => {
  return (
    <section className="hero">
      <Container>
        <div className="hero-content">
          <h1 className="hero-title">
            Превратите свои сны
            <span className="gradient-text"> в видимые образы</span>
          </h1>
          <p className="hero-subtitle">
            DreamBrum — это AI-дневник, который не только сохраняет ваши сны,
            но и визуализирует их, помогая увидеть скрытые паттерны и лучше понять себя.
          </p>
          <div className="hero-actions">
            <Button size="large">Попробовать бесплатно</Button>
            <Button variant="secondary" size="large">
              Смотреть демо
            </Button>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">12.4%</span>
              <span className="stat-label">Рост рынка wellness</span>
            </div>
            <div className="stat">
              <span className="stat-number">86%</span>
              <span className="stat-label">Видят сны регулярно</span>
            </div>
            <div className="stat">
              <span className="stat-number">65%</span>
              <span className="stat-label">Забывают детали</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default Hero;