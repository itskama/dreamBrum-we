import React, { useState, useEffect } from 'react';
import './DreamAnalyzer.css'; // используем те же стили
import Button from './ui/Button';
import Container from './ui/Container';

// Эмодзи для эмоций
const emotionEmojis = {
    anger: '😠',
    fear: '😨',
    joy: '😊',
    love: '❤️',
    sadness: '😢',
    surprise: '😲',
    neutral: '😐'
};

// Русские названия эмоций
const emotionNames = {
    anger: 'Злость',
    fear: 'Страх',
    joy: 'Радость',
    love: 'Любовь',
    sadness: 'Грусть',
    surprise: 'Удивление',
    neutral: 'Нейтрально'
};

const LocalDreamAnalyzer = () => {
    const [dreamText, setDreamText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [emotions, setEmotions] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [modelStatus, setModelStatus] = useState('Загрузка модели...');
    const [model, setModel] = useState(null);

    // Загружаем модель при запуске компонента
    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            setModelStatus('⏳ Загружаем модель из кэша (может занять 1-2 секунды)...');

            // Динамический импорт, чтобы не грузить сразу всё приложение
            const { pipeline, env } = await import('@xenova/transformers');

            // Важно: настраиваем библиотеку на использование скачанных файлов
            env.allowRemoteModels = false; // Отключаем скачивание из интернета
            env.allowLocalModels = true;   // Разрешаем использование локальных путей (браузер сделает fetch)
            env.localModelPath = '/models/'; // Сервер будет отдавать файлы из папки public/models

            // Загружаем модель эмоций из локальной папки distilbert-base-uncased-emotion
            const classifier = await pipeline(
                'text-classification',
                'distilbert-base-uncased-emotion',
                { quantized: false }
            );

            setModel(() => classifier);
            setModelStatus('✅ Модель готова! Можно анализировать сны.');
            console.log('🎉 Модель загружена полностью локально!');
        } catch (err) {
            console.error('❌ Ошибка загрузки модели:', err);
            setModelStatus('❌ Ошибка загрузки модели');
            setError('Не удалось загрузить модель. Убедитесь, что файлы скачаны в папку public.');
        }
    };

    const analyzeDream = async () => {
        if (!dreamText.trim()) {
            setError('Введите описание сна');
            return;
        }

        if (!model) {
            setError('Модель ещё не загружена. Подождите...');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            console.log('🔍 Анализируем локально:', dreamText);

            // 1. Токенизация текста вручную
            const { Tensor } = await import('@xenova/transformers');
            const inputs = await model.tokenizer(dreamText);

            // 2. Явное приведение к int32 (ONNX в браузере часто не поддерживает int64)
            const input_ids = new Tensor(
                'int32',
                Int32Array.from(inputs.input_ids.data, x => Number(x)),
                inputs.input_ids.dims
            );
            const attention_mask = new Tensor(
                'int32',
                Int32Array.from(inputs.attention_mask.data, x => Number(x)),
                inputs.attention_mask.dims
            );

            // 3. Запуск инференса напрямую через сессию ONNX (минуя обертки)
            // Это позволяет получить сырые результаты, даже если они называются иначе в ONNX-файле
            const rawOutput = await model.model.session.run({ input_ids, attention_mask });

            // 4. Ручной пост-процессинг (вместо _postprocess для стабильности)
            // Пытаемся найти логиты в сыром ответе
            const logitsTensor = rawOutput.logits || Object.values(rawOutput)[0];

            if (!logitsTensor || !logitsTensor.data) {
                console.error('❌ Неожиданный ответ модели:', rawOutput);
                throw new Error('Модель не вернула данные (logits)');
            }

            const logits = Array.from(logitsTensor.data);

            // Вычисляем Softmax: exp(x) / sum(exp(x))
            // Используем maxLogit для предотвращения переполнения Math.exp
            const maxLogit = Math.max(...logits);
            const scores = logits.map(l => Math.exp(l - maxLogit));
            const sumScores = scores.reduce((a, b) => a + b, 0);
            const probabilities = scores.map(s => s / sumScores);

            // Получаем маппинг меток (из пайплайна или внутренней модели)
            const id2label = model.config?.id2label || model.model?.config?.id2label;
            
            if (!id2label) {
                console.error('❌ Не удалось найти id2label в', model);
                throw new Error('Конфигурация модели не загружена');
            }

            // Формируем массив результатов как в пайплайне
            const result = Object.entries(id2label).map(([id, label]) => ({
                label: label,
                score: probabilities[Number(id)]
            }));

            console.log('✅ Результат:', result);

            // Transformers.js возвращает массив с результатами
            if (Array.isArray(result) && result.length > 0) {
                // Сортируем по вероятности
                const sortedEmotions = result
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
            }
        } catch (err) {
            console.error('❌ Ошибка анализа:', err);
            setError('Ошибка при анализе текста');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="dream-analyzer">
            <Container>
                <h2 className="section-title">🧠 Локальный AI-анализ</h2>


                {/* Статус загрузки модели */}
                <div className="model-status" style={{
                    padding: '12px',
                    marginBottom: '20px',
                    background: modelStatus.includes('✅') ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                    border: `1px solid ${modelStatus.includes('✅') ? '#4CAF50' : '#FF9800'}`,
                    borderRadius: '8px',
                    color: modelStatus.includes('✅') ? '#4CAF50' : '#FF9800',
                    textAlign: 'center'
                }}>
                    {modelStatus}
                </div>

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
                                disabled={isAnalyzing || !model}
                                size="large"
                            >
                                {isAnalyzing ? '🤔 Анализируем...' : '✨ Анализировать сон'}
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
                        🔬 Локальная модель: <strong>distilbert-base-uncased-emotion</strong><br />
                        ✅ Работает полностью в браузере, без сервера и интернета после загрузки!
                    </p>
                </div>
            </Container>
        </section>
    );
};

export default LocalDreamAnalyzer;