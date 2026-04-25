import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { useAuth } from '../contexts/AuthContext';
import { ref, push, set, update } from 'firebase/database';
import { db } from '../firebase';
import './DreamAnalyzer.css';
import Button from './ui/Button';
import Container from './ui/Container';
import { translations } from '../translations';
import DreamVisualizer from './DreamVisualizer';

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

const LocalDreamAnalyzer = () => {
    const authContext = useAuth();
    const currentUser = authContext?.currentUser;
    const userSettings = authContext?.userSettings;

    const t = translations[userSettings?.language || 'ru'] || translations.ru;

    const [dreamText, setDreamText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [emotions, setEmotions] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [modelStatus, setModelStatus] = useState('modelLoading');
    const [model, setModel] = useState(null);
    const [translator, setTranslator] = useState(null);
    const [isTranslating, setIsTranslating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [currentRecordRef, setCurrentRecordRef] = useState(null);

    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            setModelStatus('modelLoadingCache');

            const { pipeline, env } = await import('@xenova/transformers');
            env.allowRemoteModels = true;
            env.allowLocalModels = true;
            env.localModelPath = '/models/';

            const classifier = await pipeline(
                'text-classification',
                'distilbert-base-uncased-emotion',
                { quantized: false }
            );

            setModel(() => classifier);
            setModelStatus('modelReady');
        } catch (err) {
            console.error('❌ Model error:', err);
            setModelStatus('modelError');
            setError(userSettings?.language === 'en' ? 'Failed to load model.' : 'Не удалось загрузить модель.');
        }
    };

    const handleImageGenerated = async (base64Image) => {
        setGeneratedImage(base64Image);
        
        // If we have a record in DB, update it with the image
        if (currentRecordRef && currentUser) {
            try {
                await update(currentRecordRef, { image: base64Image });
            } catch (e) {
                console.error('❌ Error updating record with image:', e);
            }
        }
    };

    const analyzeDream = async () => {
        if (!dreamText.trim()) {
            setError(t.analyzer.inputError);
            return;
        }

        if (!model) {
            setError(t.analyzer.waitModel);
            return;
        }

        setIsAnalyzing(true);
        setError(null);
        setEmotions(null);
        setGeneratedImage(null);
        setCurrentRecordRef(null);

        let textToAnalyze = dreamText;
        const needsTranslation = /[а-яё]/i.test(dreamText);

        try {
            if (needsTranslation) {
                setIsTranslating(true);
                setModelStatus(t.analyzer.translating);
                
                try {
                    let classifierTranslator = translator;
                    if (!classifierTranslator) {
                        const { pipeline } = await import('@xenova/transformers');
                        classifierTranslator = await pipeline(
                            'translation',
                            'Xenova/opus-mt-ru-en',
                            { quantized: true }
                        );
                        setTranslator(() => classifierTranslator);
                    }

                    const translation = await classifierTranslator(dreamText, {
                        max_length: 512,
                        num_beams: 1,
                        do_sample: false,
                    });
                    textToAnalyze = translation[0].translation_text;
                    setDreamText(textToAnalyze);
                } catch (err) {
                    console.error('❌ Translation error:', err);
                    setError(t.analyzer.error);
                    setIsAnalyzing(false);
                    return;
                } finally {
                    setIsTranslating(false);
                }
            }

            const { Tensor } = await import('@xenova/transformers');
            const inputs = await model.tokenizer(textToAnalyze);

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

            const rawOutput = await model.model.session.run({ input_ids, attention_mask });
            const logitsTensor = rawOutput.logits || Object.values(rawOutput)[0];

            if (!logitsTensor || !logitsTensor.data) {
                throw new Error('No logits received');
            }

            const logits = Array.from(logitsTensor.data);
            const maxLogit = Math.max(...logits);
            const scores = logits.map(l => Math.exp(l - maxLogit));
            const sumScores = scores.reduce((a, b) => a + b, 0);
            const probabilities = scores.map(s => s / sumScores);

            const id2label = model.config?.id2label || model.model?.config?.id2label;

            const result = Object.entries(id2label).map(([id, label]) => ({
                label: label,
                score: probabilities[Number(id)]
            }));

            if (Array.isArray(result) && result.length > 0) {
                const sortedEmotions = result
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5);

                setEmotions(sortedEmotions);

                const newHistoryItem = {
                    text: dreamText,
                    emotions: sortedEmotions,
                    date: new Date().toLocaleString(),
                    mainEmotion: sortedEmotions[0].label
                };

                setHistory(prev => [newHistoryItem, ...prev.slice(0, 4)]);

                if (currentUser && (userSettings?.saveHistory !== false)) {
                    try {
                        const historyRef = ref(db, `users/${currentUser.uid}/history`);
                        const newRecordRef = push(historyRef);
                        set(newRecordRef, newHistoryItem);
                        setCurrentRecordRef(newRecordRef);
                    } catch (e) {
                        console.error('❌ Firebase error:', e);
                    }
                }
            }
        } catch (err) {
            console.error('❌ Analysis error:', err);
            setError(t.analyzer.error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <section className="dream-analyzer" id="analyzer">
            <Container>
                <h2 className="section-title">{t.analyzer.title}</h2>

                <div className="model-status" style={{
                    padding: '12px',
                    marginBottom: '20px',
                    background: modelStatus === 'modelReady' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)',
                    border: `1px solid ${modelStatus === 'modelReady' ? '#4CAF50' : '#FF9800'}`,
                    borderRadius: '8px',
                    color: modelStatus === 'modelReady' ? '#4CAF50' : '#FF9800',
                    textAlign: 'center'
                }}>
                    {t.analyzer[modelStatus]}
                </div>

                <div className="analyzer-container">
                    <div className="input-section">
                        <textarea
                            className="dream-input"
                            placeholder={t.analyzer.placeholder}
                            value={dreamText}
                            onChange={(e) => setDreamText(e.target.value)}
                            rows="5"
                        />

                        <div className="button-group">
                            <Button
                                onClick={analyzeDream}
                                disabled={isAnalyzing || !model}
                                size="large"
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                {isAnalyzing ? (
                                    isTranslating ? t.analyzer.translating : t.analyzer.analyzing
                                ) : t.analyzer.analyzeBtn}
                            </Button>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                        
                        {emotions && currentUser && userSettings?.visualizationEnabled && (
                            <DreamVisualizer 
                                dreamText={dreamText} 
                                t={t} 
                                onImageGenerated={handleImageGenerated}
                            />
                        )}
                        
                        {!currentUser && userSettings?.visualizationEnabled && (
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                                {t.visualizer.loginRequired}
                            </p>
                        )}
                    </div>

                    <div className="results-and-history">
                        {emotions && (
                            <div className="results-section">
                                <h3>{t.analyzer.results}</h3>
                                <div className="emotion-bars">
                                    {emotions.map((emotion, idx) => (
                                        <div key={idx} className="emotion-item">
                                            <div className="emotion-label">
                                                <span className="emotion-icon">
                                                    {emotionEmojis[emotion.label] || '❓'}
                                                </span>
                                                <span className="emotion-name">
                                                    {t.emotions[emotion.label] || emotion.label}
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
                                        {t.analyzer.mainEmotion}: <strong>{t.emotions[emotions[0].label]}</strong>
                                        ({(emotions[0].score * 100).toFixed(1)}%)
                                    </span>
                                </div>
                            </div>
                        )}

                        {history.length > 0 && (
                            <div className="history-section">
                                <h3>{t.analyzer.lastAnalyzes}</h3>
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
                                                <span>{t.emotions[item.mainEmotion]}</span>
                                            </div>
                                            <div className="history-date">{item.date}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="model-info">
                    <p>
                        {t.analyzer.localModel} <strong>distilbert-base-uncased-emotion</strong>
                    </p>
                </div>
            </Container>
        </section>
    );
};

export default LocalDreamAnalyzer;