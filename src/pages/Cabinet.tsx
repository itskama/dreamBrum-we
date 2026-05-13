import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, push, set } from 'firebase/database';
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

const Cabinet: React.FC = () => {
  const { currentUser, userSettings } = useAuth();
  const navigate = useNavigate();
  const t = translations[userSettings?.language || 'ru'] || translations.ru;

  const [dreamText, setDreamText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{ emotions: any[], image: string | null } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadModel();
  }, [currentUser, navigate]);

  const loadModel = async () => {
    try {
      const { pipeline, env } = await import('@xenova/transformers');
      env.allowRemoteModels = false;
      env.localModelPath = '/models/';
      // Use quantized: false because model_quantized.onnx is missing locally
      const classifier = await pipeline('text-classification', 'distilbert-base-uncased-emotion', { 
        quantized: false,
        progress_callback: (p: any) => console.log(`Model: ${p.status} ${Math.round(p.progress || 0)}%`)
      });
      setModel(() => classifier);
    } catch (err: any) {
      console.error('Model load error:', err);
      setError('AI model load error. Please refresh.');
    }
  };

  const handleAnalyze = async () => {
    if (!dreamText.trim() || !currentUser) return;
    setIsAnalyzing(true);
    setError(null);
    setResults(null);

    let textToAnalyze = dreamText;
    const needsTranslation = /[а-яё]/i.test(dreamText);

    try {
      // Start Image generation in parallel with translation/analysis to save time
      const seed = Math.floor(Math.random() * 1000000);
      
      if (needsTranslation) {
        setIsTranslating(true);
        const { pipeline } = await import('@xenova/transformers');
        const translator = await pipeline('translation', 'Xenova/opus-mt-ru-en', { quantized: true });
        const translation = await translator(dreamText) as any;
        if (translation && translation[0]?.translation_text) {
          textToAnalyze = translation[0].translation_text;
        }
        setIsTranslating(false);
      }

      if (!model) throw new Error('AI model is still loading.');

      // 1. Analyze emotions
      const { Tensor } = await import('@xenova/transformers');
      const inputs = await model.tokenizer(textToAnalyze, { padding: true, truncation: true, max_length: 512 });
      const input_ids = new Tensor('int32', Int32Array.from(inputs.input_ids.data, x => Number(x)), inputs.input_ids.dims);
      const attention_mask = new Tensor('int32', Int32Array.from(inputs.attention_mask.data, x => Number(x)), inputs.attention_mask.dims);
      const rawOutput = await model.model.session.run({ input_ids, attention_mask });
      const logitsTensor = rawOutput.logits || Object.values(rawOutput)[0];
      const logits = Array.from(logitsTensor.data as Float32Array);
      const maxLogit = Math.max(...logits);
      const scores = logits.map(l => Math.exp(l - maxLogit));
      const sumScores = scores.reduce((a, b) => a + b, 0);
      const probabilities = scores.map(s => s / sumScores);
      const labels = ["sadness", "joy", "love", "anger", "fear", "surprise"];
      const output = labels.map((label, index) => ({
        label,
        score: probabilities[index] || 0
      })).sort((a, b) => b.score - a.score);

      // 2. Prepare Image URL (Minimal parameters to avoid 403 blocks)
      const p = encodeURIComponent(`${textToAnalyze.substring(0, 100)}. dreamlike surrealism`);
      const imageUrl = `https://image.pollinations.ai/prompt/${p}?seed=${seed}`;
      
      const mainEmotion = output[0].label;
      
      // 3. Set Results
      setResults({
        emotions: output,
        image: imageUrl
      });

      // 4. Save to Firebase immediately
      const historyRef = ref(db, `users/${currentUser.uid}/history`);
      const newRecordRef = push(historyRef);
      await set(newRecordRef, {
        text: dreamText,
        mainEmotion,
        emotions: output,
        image: imageUrl,
        date: new Date().toLocaleString()
      });

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(`Error: ${err.message || 'Unknown'}`);
    } finally {
      setIsAnalyzing(false);
      setIsTranslating(false);
    }
  };

  return (
    <div className="cabinet-container">
      <div className="container">
        {!results ? (
          <div className="card dream-input-card">
            <h2 className="card-title">{t.cabinet.describeDream}</h2>
            <textarea
              value={dreamText}
              onChange={(e) => setDreamText(e.target.value)}
              placeholder={t.cabinet.placeholder}
              className="dream-textarea"
            />
            <button 
              className="btn-purple" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !model || !dreamText.trim()}
            >
              {isAnalyzing ? t.cabinet.analyzing : t.cabinet.analyzeBtn}
            </button>
            {(isTranslating || !model) && <p className="status-subtext">{!model ? t.cabinet.modelLoading : t.cabinet.translating}</p>}
            {error && <p className="error-text">{error}</p>}
          </div>
        ) : (
          <div className="results-grid">
            <div className="card results-card">
              <h3 className="card-title">{t.cabinet.emotionalLandscape}</h3>
              <div className="emotion-bars">
                {results.emotions.map((em, i) => (
                  <div key={i} className="emotion-row">
                    <div className="emotion-info">
                      <span>{emotionEmojis[em.label] || '✨'} {t.emotions[em.label] || em.label}</span>
                      <span>{Math.round(em.score * 100)}%</span>
                    </div>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: `${em.score * 100}%` }}></div></div>
                  </div>
                ))}
              </div>
              <button className="btn-purple mt-4" onClick={() => setResults(null)}>{t.cabinet.analyzeAnother}</button>
            </div>
            <div className="card image-card">
              <h3 className="card-title">{t.cabinet.visualInterpretation}</h3>
              <div className="image-container-main">
                <img 
                  src={results.image!} 
                  alt="Dream Visual" 
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.parentElement?.classList.add('loaded');
                  }}
                />
                <div className="image-loading-overlay">
                  <span className="spinner"></span>
                  <p>{t.cabinet.generatingImage}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .cabinet-container { padding-top: 100px; padding-bottom: 60px; min-height: 100vh; background-color: var(--bg-color); }
        .dream-input-card { max-width: 720px; margin: 0 auto; padding: 40px; }
        .card-title { color: var(--text-dark); margin-bottom: 24px; font-weight: 800; }
        .dream-textarea { min-height: 200px; width: 100%; padding: 20px; border-radius: 12px; margin-bottom: 20px; background: white; color: var(--text-dark); border: 1px solid rgba(0,0,0,0.1); font-size: 1.1rem; }
        .status-subtext { text-align: center; margin-top: 10px; color: var(--rose); font-weight: 600; }
        .error-text { color: #ff4d4d; text-align: center; margin-top: 15px; }
        .results-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
        .emotion-bars { display: flex; flex-direction: column; gap: 15px; }
        .emotion-info { display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark); margin-bottom: 5px; }
        .progress-bar { height: 8px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; }
        .progress-fill { height: 100%; background: var(--purple); border-radius: 4px; }
        .image-container-main { width: 100%; aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; background: #1a1a1a; position: relative; }
        .image-container-main img { width: 100%; height: 100%; object-fit: cover; opacity: 0; transition: opacity 0.5s ease; position: relative; z-index: 2; }
        .image-container-main.loaded img { opacity: 1; }
        .image-loading-overlay { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 15px; color: white; z-index: 1; }
        .image-loading-overlay p { font-size: 0.9rem; font-weight: 600; opacity: 0.8; }
        .image-container-main.loaded .image-loading-overlay { display: none; }
        .mt-4 { margin-top: 24px; }
        @media (max-width: 768px) { .results-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
};

export default Cabinet;
