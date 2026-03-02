import React from 'react';
import './Footer.css';
import Container from './ui/Container';

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo">
              <span className="logo-icon">🌙</span>
              <span className="logo-text">DreamBrum</span>
            </div>
            <p className="footer-description">
              AI-дневник для визуализации и анализа сновидений
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Продукт</h4>
              <a href="#features">Возможности</a>
              <a href="#demo">Демо</a>
              <a href="#pricing">Цены</a>
            </div>
            <div className="footer-column">
              <h4>Ресурсы</h4>
              <a href="#blog">Блог</a>
              <a href="#research">Исследования</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="footer-column">
              <h4>Компания</h4>
              <a href="#about">О нас</a>
              <a href="#contact">Контакты</a>
              <a href="#privacy">Конфиденциальность</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © 2026 DreamBrum. Все права защищены.
          </p>
          <div className="social-links">
            <a href="#" className="social-link" aria-label="Twitter">𝕏</a>
            <a href="#" className="social-link" aria-label="Facebook">📘</a>
            <a href="#" className="social-link" aria-label="Instagram">📷</a>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;