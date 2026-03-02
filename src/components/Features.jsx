import React from 'react';
import './Features.css';
import Container from './ui/Container';

const features = [
  {
    icon: '🎤',
    title: 'Быстрая запись',
    description: 'Голосовой или текстовый ввод сразу после пробуждения. Ни одна деталь не ускользнёт.'
  },
  {
    icon: '🎨',
    title: 'AI-визуализация',
    description: 'Нейросеть превращает ваше описание в уникальное изображение. Увидьте свой сон.'
  },
  {
    icon: '📊',
    title: 'Автоматический анализ',
    description: 'Система сама находит повторяющиеся темы и символы, показывая скрытые паттерны.'
  },
  {
    icon: '🗂️',
    title: 'Умный архив',
    description: 'Все сны хранятся как галерея образов. Легко найти любой момент.'
  }
];

const Features = () => {
  return (
    <section id="features" className="features">
      <Container>
        <h2 className="section-title">Возможности DreamBrum</h2>
        <p className="section-subtitle">
          Всё, что нужно для осознанного исследования своих сновидений
        </p>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
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