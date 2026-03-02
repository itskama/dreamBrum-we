import React, { useState } from 'react';
import './DreamArchive.css';
import Container from './ui/Container';
import Button from './ui/Button';

const mockDreams = [
  {
    id: 1,
    date: '26.02.26',
    text: 'В небе плыли не облака, а гигантские полупрозрачные медузы...',
    emotion: '😌',
    tags: ['полёт', 'фантастика', 'спокойствие']
  },
  {
    id: 2,
    date: '25.02.26',
    text: 'Я стоял на берегу стеклянного озера, в котором вместо воды была ртуть...',
    emotion: '🤔',
    tags: ['вода', 'зеркало', 'загадка']
  },
  {
    id: 3,
    date: '24.02.26',
    text: 'Бесконечная библиотека с полками до самого неба...',
    emotion: '📚',
    tags: ['книги', 'поиск', 'знания']
  }
];

const DreamArchive = () => {
  const [dreams] = useState(mockDreams);
  const [viewMode, setViewMode] = useState('grid');

  return (
    <section id="demo" className="dream-archive">
      <Container>
        <div className="archive-header">
          <h2 className="section-title">Ваши сны</h2>
          <div className="archive-controls">
            <button 
              className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="Сетка"
            >
              <span className="toggle-icon">⊞</span>
            </button>
            <button 
              className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="Список"
            >
              <span className="toggle-icon">☷</span>
            </button>
          </div>
        </div>

        <div className={`dreams-container ${viewMode}`}>
          {dreams.map(dream => (
            <div key={dream.id} className="dream-card">
              <div className="dream-image">
                <div className="image-placeholder">
                  <span>✨</span>
                </div>
              </div>
              <div className="dream-content">
                <div className="dream-meta">
                  <span className="dream-date">{dream.date}</span>
                  <span className="dream-emotion">{dream.emotion}</span>
                </div>
                <p className="dream-text">{dream.text}</p>
                <div className="dream-tags">
                  {dream.tags.map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="archive-footer">
          <Button variant="secondary">
            Показать ещё
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default DreamArchive;