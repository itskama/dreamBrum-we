import React from 'react';
import './Footer.css';
import Container from './ui/Container';
import { useAuth } from '../contexts/AuthContext';
import { translations } from '../translations';

const Footer = () => {
  const { userSettings } = useAuth();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

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
              {t.footer.description}
            </p>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>{t.footer.product}</h4>
              <a href="#features">{t.footer.features}</a>
              <a href="#demo">{t.footer.demo}</a>
              <a href="#pricing">{t.footer.pricing}</a>
            </div>
            <div className="footer-column">
              <h4>{t.footer.resources}</h4>
              <a href="#blog">{t.footer.blog}</a>
              <a href="#research">{t.footer.research}</a>
              <a href="#faq">{t.footer.faq}</a>
            </div>
            <div className="footer-column">
              <h4>{t.footer.company}</h4>
              <a href="#about">{t.footer.about}</a>
              <a href="#contact">{t.footer.contact}</a>
              <a href="#privacy">{t.footer.privacy}</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            {t.footer.copyright}
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