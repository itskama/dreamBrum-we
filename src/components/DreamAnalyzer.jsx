import React, { useState } from 'react';
import './DreamAnalyzer.css';
import Button from './ui/Button';
import Container from './ui/Container';

// Эмодзи для разных эмоций
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

// Русские названия эмоций
const emotionNames = {
    joy: 'Радость',
    sadness: 'Грусть',
    anger: 'Злость',
    fear: 'Страх',
    love: 'Любовь',
    surprise: 'Удивление',
    disgust: 'Отвращение',
    neutral: 'Нейтрально',
    positive: 'Позитив',
    negative: 'Негатив'
};

const DreamAnalyzer = () => {
    const [dreamText, setDreamText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [emotions, setEmotions] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);

    const analyzeDream = async () => {
        if (!dreamText.trim()) {
            setError('Введите описание сна');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            console.log('📤 Отправка запроса к proxy-серверу...');

            const response = await fetch(
                'http://localhost:3001/api/analyze-emotion',
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({ text: dreamText }),
                }
            );

            console.log('📥 Статус ответа:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Результат от модели:', result);

            // Обработка разных форматов ответа (некоторые модели возвращают [[{...}]], некоторые [{...}])
            let finalData = null;
            if (Array.isArray(result)) {
                if (result.length > 0) {
                    finalData = Array.isArray(result[0]) ? result[0] : result;
                }
            }

            if (finalData) {
                const sortedEmotions = [...finalData]
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                setEmotions(sortedEmotions);

                setHistory(prev => [
                    {
                        text: dreamText,
                        emotions: sortedEmotions,
                        date: new Date().toLocaleString(),
                        mainEmotion: sortedEmotions[0].label
                    },
                    ...prev.slice(0, 4)
                ]);
            } else {
                console.error('❌ Неожиданный тип данных:', typeof result, result);
                if (result && result.error) {
                    setError(`Модель вернула ошибку: ${result.error}`);
                } else {
                    setError('Неожиданный формат ответа от модели. Проверьте консоль.');
                }
            }
        } catch (err) {
            console.error('❌ Ошибка:', err);
            setError(err.message || 'Не удалось подключиться к модели');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const testConnection = async () => {
        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:3001/api/health');
            const data = await response.json();
            alert(`✅ Сервер работает: ${data.message}`);
        } catch (err) {
            alert(`❌ Сервер не доступен: ${err.message}\nЗапустите proxy-сервер командой: node server.js`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="dream-analyzer">
            <Container>
                <h2 className="section-title">Попробуйте AI-анализ прямо сейчас</h2>
                <p className="section-subtitle">
                    Опишите свой сон на английском (модель обучена на английском), и нейросеть определит эмоции
                </p>

                <div className="analyzer-container">
                    <div className="input-section">
                        <textarea
                            className="dream-input"
                            placeholder="Например: I was flying over mountains, feeling free and happy..."
                            value={dreamText}
                            onChange={(e) => setDreamText(e.target.value)}
                            rows="5"
                        />

                        <div className="button-group">
                            <Button
                                onClick={analyzeDream}
                                disabled={isAnalyzing}
                                size="large"
                            >
                                {isAnalyzing ? 'Анализируем...' : '✨ Анализировать сон'}
                            </Button>

                            <Button
                                onClick={testConnection}
                                disabled={isAnalyzing}
                                variant="secondary"
                                size="medium"
                            >
                                🔌 Проверить сервер
                            </Button>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                    </div>

                    {emotions && (
                        <div className="results-section">
                            <h3>Результаты анализа:</h3>
                            <div className="emotion-bars">
                                {emotions.map((emotion, idx) => (
                                    <div key={idx} className="emotion-item">
                                        <div className="emotion-label">
                                            <span className="emotion-icon">
                                                {emotionEmojis[emotion.label] || '❓'}
                                            </span>
                                            <span className="emotion-name">
                                                {emotionNames[emotion.label] || emotion.label}
                                            </span>
                                            <span className="emotion-score">
                                                {(emotion.score * 100).toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${emotion.score * 100}%`,
                                                    backgroundColor: emotion.score > 0.5 ? '#7B68EE' : '#9F8BFF'
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="main-emotion">
                                <span className="main-emotion-icon">
                                    {emotionEmojis[emotions[0].label] || '✨'}
                                </span>
                                <span className="main-emotion-text">
                                    Главная эмоция: <strong>{emotionNames[emotions[0].label]}</strong>
                                    ({(emotions[0].score * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                    )}

                    {history.length > 0 && (
                        <div className="history-section">
                            <h3>Последние анализы:</h3>
                            <div className="history-list">
                                {history.map((item, idx) => (
                                    <div key={idx} className="history-item">
                                        <div className="history-text">
                                            {item.text.substring(0, 50)}...
                                        </div>
                                        <div className="history-emotion">
                                            <span className="history-icon">
                                                {emotionEmojis[item.mainEmotion] || '✨'}
                                            </span>
                                            <span>{emotionNames[item.mainEmotion]}</span>
                                        </div>
                                        <div className="history-date">{item.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="model-info">
                    <p>
                        🔬 Архитектура: React Frontend → Node.js Proxy → Hugging Face API<br />
                        Модель: <strong>cardiffnlp/twitter-roberta-base-sentiment-latest</strong>
                    </p>
                </div>
            </Container>
        </section>
    );
};

export default DreamAnalyzer;