import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, push, set, get, child } from 'firebase/database';
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

const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
const isSpeechSupported = !!SpeechRecognition;

const MicIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
  </svg>
);

const StopIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M6 6h12v12H6V6z"/>
  </svg>
);

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
  const [recentDreams, setRecentDreams] = useState<any[]>([]);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isSpeechSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = userSettings?.language === 'ru' ? 'ru-RU' : 'en-US';

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setDreamText((prev) => {
        const spacing = prev.trim() === '' ? '' : ' ';
        return prev + spacing + transcript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError(t.cabinet.voiceError);
      } else {
        setError(`Voice input error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [userSettings?.language, t]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError(t.cabinet.voiceNotSupported);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err: any) {
        console.error('Failed to start speech recognition', err);
        setError(err.message);
      }
    }
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadModel();
    fetchRecentDreams();
  }, [currentUser, navigate]);

  const fetchRecentDreams = async () => {
    if (!currentUser) return;
    try {
      const snapshot = await get(child(ref(db), `users/${currentUser.uid}/history`));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const historyArray = Object.keys(data).map(id => ({ id, ...data[id] })).reverse().slice(0, 3);
        setRecentDreams(historyArray);
      }
    } catch (err) {
      console.error('Fetch recent error:', err);
    }
  };

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
          <div className="cabinet-input-layout">
            <div className="card dream-input-card">
              <div className="dream-input-header">
                <h2 className="card-title">{t.cabinet.describeDream}</h2>
                {isSpeechSupported && (
                  <button
                    type="button"
                    className={`voice-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleListening}
                    title={isListening ? t.cabinet.voiceListening : t.cabinet.voiceStart}
                  >
                    {isListening ? <StopIcon /> : <MicIcon />}
                  </button>
                )}
              </div>
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
              
              <div className="tips-card">
                <h4 className="tips-title">{t.cabinet.tipsTitle}</h4>
                <div className="tips-list">
                  <div className="tip-pill">{t.cabinet.tip1}</div>
                  <div className="tip-pill">{t.cabinet.tip2}</div>
                  <div className="tip-pill">{t.cabinet.tip3}</div>
                </div>
              </div>
            </div>

            <div className="recent-dreams-section">
              <h3 className="recent-title">{t.cabinet.recentDreams}</h3>
              {recentDreams.length > 0 ? (
                <div className="recent-list">
                  {recentDreams.map((dream) => (
                    <div key={dream.id} className="recent-card" onClick={() => setResults({ emotions: dream.emotions, image: dream.image })}>
                      <div className="recent-card-top">
                        <span className="recent-date">{dream.date?.split(',')[0]}</span>
                        <span className="recent-emotion-badge">
                          {emotionEmojis[dream.mainEmotion]} {t.emotions[dream.mainEmotion] || dream.mainEmotion}
                        </span>
                      </div>
                      <p className="recent-preview">{dream.text.length > 60 ? dream.text.substring(0, 60) + '...' : dream.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-recent">
                  <p>{t.cabinet.noRecentDreams}</p>
                </div>
              )}
            </div>
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
        .cabinet-input-layout { max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        .dream-input-card { padding: 40px; margin: 0; }
        .dream-input-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .dream-input-header .card-title { margin-bottom: 0; }
        .card-title { color: var(--text-dark); margin-bottom: 24px; font-weight: 800; }
        .dream-textarea { min-height: 200px; width: 100%; padding: 20px; border-radius: 12px; margin-bottom: 20px; background: white; color: var(--text-dark); border: 1px solid rgba(0,0,0,0.1); font-size: 1.1rem; }
        
        .voice-btn {
          background: rgba(107, 58, 138, 0.1);
          color: var(--purple);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          border: 1px solid rgba(107, 58, 138, 0.2);
        }
        .voice-btn:hover {
          background: rgba(107, 58, 138, 0.2);
          transform: scale(1.05);
        }
        .voice-btn.listening {
          background: #ff4d4d;
          color: white;
          border-color: #ff4d4d;
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 77, 77, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 77, 77, 0);
          }
        }
        .status-subtext { text-align: center; margin-top: 10px; color: var(--rose); font-weight: 600; }
        .error-text { color: #ff4d4d; text-align: center; margin-top: 15px; }
        
        .tips-card { background-color: #F3F1EC; padding: 20px; border-radius: 12px; margin-top: 30px; }
        .tips-title { font-size: 1rem; font-weight: 700; color: #4A4A4A; margin-bottom: 12px; }
        .tips-list { display: flex; flex-direction: column; gap: 8px; }
        .tip-pill { background-color: white; padding: 8px 12px; border-radius: 20px; font-size: 0.85rem; color: #555; font-weight: 600; display: inline-block; width: fit-content; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
        
        .recent-dreams-section { width: 100%; }
        .recent-title { color: white; font-size: 1.3rem; font-weight: 700; margin-bottom: 20px; }
        .recent-list { display: flex; flex-direction: column; gap: 15px; }
        .recent-card { background-color: rgba(255, 255, 255, 0.05); padding: 16px 20px; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.1); cursor: pointer; transition: all 0.3s ease; }
        .recent-card:hover { background-color: rgba(255, 255, 255, 0.1); transform: translateY(-2px); border-color: rgba(255, 255, 255, 0.2); }
        .recent-card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .recent-date { font-size: 0.8rem; color: rgba(255, 255, 255, 0.6); font-weight: 600; }
        .recent-emotion-badge { background-color: rgba(0, 0, 0, 0.3); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; color: white; font-weight: 600; }
        .recent-preview { font-size: 0.95rem; color: rgba(255, 255, 255, 0.85); line-height: 1.5; margin: 0; }
        .empty-recent { background-color: rgba(255, 255, 255, 0.03); padding: 30px; border-radius: 12px; text-align: center; border: 1px dashed rgba(255, 255, 255, 0.1); }
        .empty-recent p { color: rgba(255, 255, 255, 0.6); font-size: 0.9rem; margin: 0; }

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
