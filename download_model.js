const fs = require('fs');
const path = require('path');

const MODEL_DIR = path.join(__dirname, 'public', 'models', 'distilbert-base-uncased-emotion', 'onnx');

const ONNX_URL = 'https://huggingface.co/Gladiaio/bhadresh-savani_distilbert-base-uncased-emotion_onnx/resolve/main/bhadresh-savani_distilbert-base-uncased-emotion_onnx_model/1/model.bin';

async function downloadFile(url, destPath) {
    console.log(`Downloading model (~133MB) for local work...`);
    const response = await fetch(url, { redirect: 'follow' });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(destPath, buffer);
    console.log(`Saved to ${destPath}`);
}

async function main() {
    if (!fs.existsSync(MODEL_DIR)) {
        fs.mkdirSync(MODEL_DIR, { recursive: true });
    }
    const dest = path.join(MODEL_DIR, 'model.onnx');
    if (fs.existsSync(dest)) {
        console.log("Model file already exists.");
        return;
    }
    try {
        await downloadFile(ONNX_URL, dest);
    } catch (e) {
        console.error("Error downloading model", e);
    }
}

main();
