import React, { useState } from 'react';
import Button from './ui/Button';
import './DreamVisualizer.css';

const DreamVisualizer = ({ dreamText, t, onImageGenerated, autoGenerate = false }) => {
    const [image, setImage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const generateImage = async () => {
        if (!dreamText) return;
        
        setIsLoading(true);
        setError(null);
        try {
            const API_TOKEN = process.env.REACT_APP_HF_TOKEN; 
            
            if (!API_TOKEN || API_TOKEN === "hf_placeholder") {
                throw new Error("API Token is not set in .env file.");
            }

            console.log("Generating image with FLUX model via classic API:", dreamText);

            const response = await fetch("/hf-api/models/black-forest-labs/FLUX.1-schnell", {
                headers: { 
                    "Authorization": `Bearer ${API_TOKEN.trim()}`,
                    "Content-Type": "application/json",
                },
                method: "POST",
                body: JSON.stringify({ 
                    inputs: dreamText,
                    options: { wait_for_model: true }
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("HF Error:", errorData);
                throw new Error(errorData.error || `Server returned ${response.status}`);
            }

            const blob = await response.blob();
            
            if (!blob.type.includes('image')) {
                throw new Error("Result is not an image. Check Hugging Face model status.");
            }

            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => {
                const base64data = reader.result;
                setImage(base64data);
                if (onImageGenerated) onImageGenerated(base64data);
            };
        } catch (err) {
            console.error("Visualization Error:", err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadImage = () => {
        if (!image) return;
        const link = document.createElement('a');
        link.href = image;
        link.download = `dream_${new Date().getTime()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Auto-generate if requested and no image yet
    React.useEffect(() => {
        if (autoGenerate && !image && !isLoading && !error && dreamText) {
            generateImage();
        }
    }, [autoGenerate, dreamText]);

    return (
        <div className="dream-visualizer-container">
            {!image && !isLoading && !autoGenerate && (
                <div className="visualizer-prompt">
                    <Button onClick={generateImage} variant="secondary" style={{ width: '100%' }}>
                        🎨 {t.visualizer.title}
                    </Button>
                </div>
            )}
            
            {isLoading && (
                <div className="visualizer-status loading">
                    <div className="loading-spinner"></div>
                    <p>{t.visualizer.loading}</p>
                </div>
            )}
            
            {error && (
                <div className="visualizer-status error">
                    <p>{error}</p>
                    <Button onClick={generateImage} size="small" variant="secondary">🔄 Try Again</Button>
                </div>
            )}
            
            {image && (
                <div className="visualizer-result">
                    <div className="image-wrapper">
                        <img src={image} alt="AI Generated Dream" />
                        <div className="image-overlay">
                            <div className="visualizer-actions">
                                <Button onClick={generateImage} variant="secondary" size="small">
                                    🔄
                                </Button>
                                <Button onClick={downloadImage} variant="primary" size="small">
                                    📥 {t.visualizer.download}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DreamVisualizer;
