import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';
import { translations } from '../translations';

const emotionEmojis: Record<string, string> = {
  anger: '😠',
  fear: '😨',
  joy: '😊',
  love: '❤️',
  sadness: '😢',
  surprise: '😲',
  neutral: '😐',
  disgust: '🤢'
};

const Library: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const navigate = useNavigate();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  const [history, setHistory] = useState<any[]>([]);
  const [emotionFilter, setEmotionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchHistory();
  }, [currentUser, navigate]);

  const fetchHistory = async () => {
    if (!currentUser) return;
    try {
      const snapshot = await get(child(ref(db), `users/${currentUser.uid}/history`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.keys(data).map(id => ({
          id,
          ...data[id]
        })).reverse();
        setHistory(historyArray);
      }
    } catch (err) {
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="library-container">
      <div className="container">
        <div className="library-header">
          <h1 className="section-title">{t.nav.myDreams}</h1>
          <div className="filter-bar">
            <button 
              className={`filter-pill ${emotionFilter === 'all' ? 'active' : ''}`}
              onClick={() => setEmotionFilter('all')}
            >
              {t.cabinet.allFilters || 'All'}
            </button>
            {Object.keys(emotionEmojis).map(emotion => (
              <button 
                key={emotion}
                className={`filter-pill ${emotionFilter === emotion ? 'active' : ''}`}
                onClick={() => setEmotionFilter(emotion)}
              >
                {emotionEmojis[emotion]} {t.emotions[emotion] || emotion}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner big"></span>
          </div>
        ) : (
          <div className="history-grid">
            {history
              .filter(item => emotionFilter === 'all' || item.mainEmotion === emotionFilter)
              .map((item) => (
                <div key={item.id} className="card history-card">
                  <div className="history-image-wrap">
                    <img src={item.image} alt="Dream" loading="lazy" />
                    <span className="history-date-badge">{item.date?.split(',')[0]}</span>
                  </div>
                  <div className="history-content">
                    <div className="history-emotion-line">
                      {emotionEmojis[item.mainEmotion]} {t.emotions[item.mainEmotion] || item.mainEmotion}
                    </div>
                    <p className="history-text-preview">{item.text}</p>
                  </div>
                </div>
              ))}
            {history.length === 0 && !loading && (
              <div className="empty-history">
                <p>No dreams recorded yet. Go to the Cabinet to analyze your first dream!</p>
                <button className="btn-purple mt-4" onClick={() => navigate('/cabinet')}>
                  Analyze Dream
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .library-container {
          padding-top: 100px;
          padding-bottom: 60px;
          min-height: 100vh;
          background-color: var(--bg-color);
        }

        .library-header {
          margin-bottom: 40px;
          animation: fadeIn 0.5s ease-out;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 24px;
        }

        .filter-bar {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-pill {
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 10px 18px;
          border-radius: 30px;
          font-size: 0.9rem;
          font-weight: 600;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
        }

        .filter-pill:hover {
          background-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .filter-pill.active {
          background-color: var(--purple);
          border-color: var(--purple);
          box-shadow: 0 4px 20px rgba(107, 58, 138, 0.4);
        }

        .loading-state {
          display: flex;
          justify-content: center;
          padding: 100px;
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
          animation: slideUp 0.6s ease-out;
        }

        .history-card {
          padding: 0;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .history-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
          border-color: rgba(107, 58, 138, 0.3);
        }

        .history-image-wrap {
          width: 100%;
          aspect-ratio: 16/9;
          position: relative;
          background-color: #1a1a1a;
        }

        .history-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .history-date-badge {
          position: absolute;
          top: 15px;
          right: 15px;
          background-color: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          color: white;
          padding: 5px 12px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
        }

        .history-content {
          padding: 24px;
        }

        .history-emotion-line {
          font-weight: 800;
          color: var(--purple);
          margin-bottom: 12px;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .history-text-preview {
          font-size: 0.95rem;
          color: var(--text-dark);
          line-height: 1.6;
          opacity: 0.85;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .empty-history {
          grid-column: 1 / -1;
          text-align: center;
          padding: 100px 20px;
          color: rgba(255, 255, 255, 0.5);
        }

        .mt-4 { margin-top: 24px; }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Library;
