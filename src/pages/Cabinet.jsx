import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';
import { translations } from '../translations';

// Эмодзи для разных эмоций (синхронизировано с DreamAnalyzer)
const emotionEmojis = {
    joy: '😊',
    sadness: '😢',
    anger: '😠',
    fear: '😨',
    love: '❤️',
    surprise: '😲',
    disgust: '🤢',
    neutral: '😐',
    positive: '✨',
    negative: '😔'
};

// Градиенты для эмоций
const emotionGradients = {
    joy: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    sadness: 'linear-gradient(135deg, #4A90E2 0%, #2171CD 100%)',
    anger: 'linear-gradient(135deg, #FF4B2B 0%, #FF416C 100%)',
    fear: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    love: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    surprise: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    disgust: 'linear-gradient(135deg, #5c634d 0%, #2f3e1a 100%)',
    neutral: 'linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)',
    positive: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    negative: 'linear-gradient(135deg, #616161 0%, #9bc5c3 100%)',
};

export default function Cabinet() {
    const { currentUser, userSettings, updateSettings, logout } = useAuth();
    const navigate = useNavigate();
    
    const [history, setHistory] = useState([]);
    const [lang, setLang] = useState(userSettings?.language || 'ru');
    const [saveHist, setSaveHist] = useState(userSettings?.saveHistory ?? true);
    const [selectedEmotion, setSelectedEmotion] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const t = translations[userSettings?.language || 'ru'] || translations.ru;
    
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        async function fetchHistory() {
            setIsLoading(true);
            try {
                const snapshot = await get(child(ref(db), `users/${currentUser.uid}/history`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    let historyList = [];
                    if (data && typeof data === 'object') {
                        historyList = Object.values(data);
                    } else if (Array.isArray(data)) {
                        historyList = data;
                    }
                    setHistory(historyList.reverse());
                }
            } catch (err) {
                console.error("Error fetching history:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchHistory();
    }, [currentUser, navigate]);

    // Обновляем локальное состояние при изменении глобальных настроек
    useEffect(() => {
        if (userSettings) {
            setLang(userSettings.language || 'ru');
            setSaveHist(userSettings.saveHistory ?? true);
        }
    }, [userSettings]);

    async function handleSaveSettings() {
        await updateSettings({ language: lang, saveHistory: saveHist });
        alert(lang === 'ru' ? 'Настройки сохранены' : 'Settings saved');
    }

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    const stats = history.reduce((acc, item) => {
        const emotion = item.mainEmotion || 'neutral';
        acc[emotion] = (acc[emotion] || 0) + 1;
        return acc;
    }, {});

    const sortedEmotions = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    const filteredHistory = selectedEmotion 
        ? history.filter(item => (item.mainEmotion || 'neutral') === selectedEmotion)
        : history;

    return (
        <Container style={{ marginTop: '120px', marginBottom: '60px', minHeight: '80vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h2 className="section-title" style={{ margin: 0 }}>{t.cabinet.title}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{currentUser?.email}</span>
                    <Button onClick={handleLogout} variant="secondary" size="small">{t.nav.logout}</Button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 3fr', gap: '30px' }}>
                <div style={{ 
                    background: 'var(--surface)', 
                    padding: '30px', 
                    borderRadius: '24px', 
                    border: '1px solid var(--border)',
                    height: 'fit-content'
                }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>{t.cabinet.settings}</h3>
                    
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>{t.cabinet.language}</label>
                        <select 
                            value={lang} 
                            onChange={(e) => setLang(e.target.value)} 
                            style={{ 
                                padding: '12px', 
                                borderRadius: '12px', 
                                width: '100%', 
                                background: 'var(--bg-secondary)', 
                                color: 'white',
                                border: '1px solid var(--border)',
                                outline: 'none'
                            }}
                        >
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', fontSize: '14px' }}>
                            <input 
                                type="checkbox" 
                                checked={saveHist} 
                                onChange={(e) => setSaveHist(e.target.checked)} 
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                            />
                            {t.cabinet.saveHistory}
                        </label>
                    </div>

                    <Button onClick={handleSaveSettings} style={{ width: '100%' }}>{t.cabinet.saveBtn}</Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ 
                        background: 'var(--surface)', 
                        padding: '30px', 
                        borderRadius: '24px', 
                        border: '1px solid var(--border)' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '600' }}>{t.cabinet.statsTitle}</h3>
                            {selectedEmotion && (
                                <button 
                                    onClick={() => setSelectedEmotion(null)}
                                    style={{ color: 'var(--primary)', fontSize: '14px', fontWeight: '500' }}
                                >
                                    {t.cabinet.resetFilter}
                                </button>
                            )}
                        </div>

                        {sortedEmotions.length > 0 ? (
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                                gap: '15px' 
                            }}>
                                {sortedEmotions.map(([emotion, count]) => (
                                    <div 
                                        key={emotion}
                                        onClick={() => setSelectedEmotion(selectedEmotion === emotion ? null : emotion)}
                                        style={{
                                            padding: '20px',
                                            borderRadius: '20px',
                                            background: selectedEmotion === emotion ? emotionGradients[emotion] : 'var(--bg-secondary)',
                                            border: selectedEmotion === emotion ? 'none' : '1px solid var(--border)',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.3s ease',
                                            transform: selectedEmotion === emotion ? 'scale(1.05)' : 'scale(1)',
                                            boxShadow: selectedEmotion === emotion ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'
                                        }}
                                    >
                                        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
                                            {emotionEmojis[emotion] || '✨'}
                                        </div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            fontSize: '14px',
                                            color: selectedEmotion === emotion ? (emotion === 'neutral' ? '#1a1a1a' : 'white') : 'var(--text-primary)'
                                        }}>
                                            {t.emotions[emotion] || emotion}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            opacity: 0.8,
                                            color: selectedEmotion === emotion ? (emotion === 'neutral' ? '#333' : 'white') : 'var(--text-secondary)'
                                        }}>
                                            {count} {t.cabinet.dreamsCount}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                {isLoading ? t.cabinet.loading : t.cabinet.noStats}
                            </div>
                        )}
                    </div>

                    <div style={{ 
                        background: 'var(--surface)', 
                        padding: '30px', 
                        borderRadius: '24px', 
                        border: '1px solid var(--border)',
                        flex: 1
                    }}>
                        <h3 style={{ marginBottom: '20px', fontSize: '1.2rem', fontWeight: '600' }}>
                            {selectedEmotion ? `${t.cabinet.historyFiltered}: ${t.emotions[selectedEmotion]}` : t.cabinet.historyTitle}
                        </h3>
                        
                        {filteredHistory.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {filteredHistory.map((record, index) => (
                                    <div 
                                        key={index} 
                                        style={{ 
                                            background: 'var(--bg-secondary)', 
                                            padding: '20px', 
                                            borderRadius: '16px',
                                            border: '1px solid var(--border)',
                                            transition: 'border-color 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '20px'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                                        onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
                                    >
                                        <div style={{ 
                                            width: '50px', 
                                            height: '50px', 
                                            borderRadius: '12px', 
                                            background: emotionGradients[record.mainEmotion || 'neutral'],
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '1.5rem',
                                            flexShrink: 0
                                        }}>
                                            {emotionEmojis[record.mainEmotion || 'neutral']}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: '400', lineHeight: '1.5' }}>
                                                {record.text}
                                            </p>
                                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                                                    {record.date}
                                                </small>
                                                <div style={{ 
                                                    fontSize: '11px', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '6px', 
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    {t.emotions[record.mainEmotion || 'neutral']}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                                {selectedEmotion ? t.cabinet.noFilteredHistory : t.cabinet.noHistory}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
}


