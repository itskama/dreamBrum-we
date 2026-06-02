import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, child, remove } from 'firebase/database';
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
  const [dateFilter, setDateFilter] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
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

  const handleDeleteDream = async (id: string) => {
    if (!currentUser) return;

    const confirmDelete = window.confirm(t.cabinet.confirmDelete || 'Are you sure you want to delete this dream?');
    if (!confirmDelete) return;

    try {
      await remove(ref(db, `users/${currentUser.uid}/history/${id}`));
      setHistory(prev => prev.filter(dream => dream.id !== id));
    } catch (err) {
      console.error('Error deleting dream:', err);
      alert('Failed to delete dream');
    }
  };

  const parseDreamDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;

    try {
      const parts = dateStr.split(',');
      const dateParts = parts[0].trim().split('.');
      if (dateParts.length === 3) {
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // 0-indexed
        const year = parseInt(dateParts[2], 10);
        
        let hour = 0, minute = 0, second = 0;
        if (parts[1]) {
          const timeParts = parts[1].trim().split(':');
          hour = parseInt(timeParts[0], 10) || 0;
          minute = parseInt(timeParts[1], 10) || 0;
          second = parseInt(timeParts[2], 10) || 0;
        }
        
        const customDate = new Date(year, month, day, hour, minute, second);
        if (!isNaN(customDate.getTime())) return customDate;
      }
    } catch (e) {
      console.error('Failed to parse date string:', dateStr, e);
    }
    return null;
  };

  const filteredHistory = history
    .filter(item => {
      // 1. Emotion Filter
      const emotionMatches = emotionFilter === 'all' || item.mainEmotion === emotionFilter;
      if (!emotionMatches) return false;

      // 2. Date Filter
      if (dateFilter) {
        const dreamDate = parseDreamDate(item.date);
        if (!dreamDate) return false;

        const [fYear, fMonth, fDay] = dateFilter.split('-').map(Number);
        return (
          dreamDate.getFullYear() === fYear &&
          dreamDate.getMonth() === fMonth - 1 &&
          dreamDate.getDate() === fDay
        );
      }

      return true;
    })
    .sort((a, b) => {
      // 3. Chronological sorting
      const dateA = parseDreamDate(a.date);
      const dateB = parseDreamDate(b.date);
      if (!dateA || !dateB) return 0;

      if (sortOrder === 'newest') {
        return dateB.getTime() - dateA.getTime();
      } else {
        return dateA.getTime() - dateB.getTime();
      }
    });

  return (
    <div className="library-container">
      <div className="container">
        <div className="library-header">
          <div className="library-header-top">
            <h1 className="section-title">{t.nav.myDreams}</h1>
            <button className="btn-new-dream" onClick={() => navigate('/cabinet')}>
              {t.cabinet.newDream}
            </button>
          </div>
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

          <div className="search-sort-bar">
            <div className="date-filter-group">
              <label htmlFor="date-picker" className="date-label">{t.cabinet.filterByDate}:</label>
              <div className="date-input-wrapper">
                <input 
                  type="date" 
                  id="date-picker"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="date-input"
                />
                {dateFilter && (
                  <button className="clear-date-btn" onClick={() => setDateFilter('')}>
                    {t.cabinet.clearFilter}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              className="sort-toggle-btn"
              onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            >
              <span>{t.cabinet.sortByDate}: <strong>{sortOrder === 'newest' ? t.cabinet.newestFirst : t.cabinet.oldestFirst}</strong></span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginLeft: '6px' }}>
                {sortOrder === 'newest' ? (
                  <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/>
                ) : (
                  <path d="M3 11h12V9H3v2zm0 7h18v-2H3v2zM3 6v2h6V6H3z"/>
                )}
              </svg>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <span className="spinner big"></span>
          </div>
        ) : (
          <div className="history-grid">
            {filteredHistory.map((item) => (
              <div key={item.id} className="card history-card">
                <div className="history-image-wrap">
                  <img src={item.image} alt="Dream" loading="lazy" />
                  <span className="history-date-badge">{item.date?.split(',')[0]}</span>
                  <button 
                    className="history-delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDream(item.id);
                    }}
                    title={t.cabinet.deleteDream || 'Delete Dream'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
                <div className="history-content">
                  <div className="history-emotion-line">
                    {emotionEmojis[item.mainEmotion]} {t.emotions[item.mainEmotion] || item.mainEmotion}
                  </div>
                  <p className="history-text-preview">{item.text}</p>
                </div>
              </div>
            ))}
            {filteredHistory.length === 0 && !loading && (
              <div className="empty-history">
                <p>
                  {dateFilter 
                    ? t.cabinet.noDreamsOnDate 
                    : (emotionFilter !== 'all' 
                      ? 'No dreams found with this emotion.' 
                      : 'No dreams recorded yet. Go to the Cabinet to analyze your first dream!')}
                </p>
                {!dateFilter && emotionFilter === 'all' && (
                  <button className="btn-purple mt-4" onClick={() => navigate('/cabinet')}>
                    Analyze Dream
                  </button>
                )}
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

        .search-sort-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background-color: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 16px 24px;
          border-radius: 16px;
          margin-top: 20px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .date-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .date-label {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0;
        }

        .date-input-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-input {
          background-color: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          outline: none;
          transition: var(--transition);
          margin-bottom: 0;
          cursor: pointer;
        }

        .date-input:focus {
          border-color: var(--purple);
          box-shadow: 0 0 0 2px rgba(107, 58, 138, 0.2);
        }

        .clear-date-btn {
          background-color: rgba(255, 77, 77, 0.1);
          color: #ff4d4d;
          border: 1px solid rgba(255, 77, 77, 0.2);
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 600;
          transition: var(--transition);
        }

        .clear-date-btn:hover {
          background-color: #ff4d4d;
          color: white;
        }

        .sort-toggle-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: rgba(255, 255, 255, 0.05);
          color: white;
          padding: 10px 18px;
          border-radius: 30px;
          font-size: 0.9rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: var(--transition);
        }

        .sort-toggle-btn:hover {
          background-color: rgba(255, 255, 255, 0.12);
          transform: translateY(-1px);
        }

        .sort-toggle-btn svg {
          color: rgba(255, 255, 255, 0.7);
        }
        
        @media (max-width: 600px) {
          .search-sort-bar {
            flex-direction: column;
            align-items: stretch;
          }
          .date-filter-group {
            flex-direction: column;
            align-items: stretch;
          }
          .sort-toggle-btn {
            justify-content: center;
          }
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0;
        }

        .library-header-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .btn-new-dream {
          background-color: var(--purple);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 30px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-new-dream:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(107, 58, 138, 0.4);
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

        .history-delete-btn {
          position: absolute;
          top: 15px;
          left: 15px;
          background-color: rgba(255, 77, 77, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 77, 77, 0.2);
          z-index: 10;
          cursor: pointer;
        }

        .history-card:hover .history-delete-btn {
          opacity: 1;
        }

        .history-delete-btn:hover {
          background-color: #ff4d4d;
          transform: scale(1.1);
          box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
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
