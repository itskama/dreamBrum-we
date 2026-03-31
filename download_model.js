const fs = require('fs');
const path = require('path');

// --- НАСТРОЙКИ ---
const MODELS_ROOT = path.join(__dirname, 'public', 'models');

// Модель классификации (DistilBERT)
const CLASSIFIER_DIR = 'distilbert-base-uncased-emotion';
const CLASSIFIER_URLS = {
    'config.json': 'https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion/resolve/main/config.json',
    'tokenizer.json': 'https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion/resolve/main/tokenizer.json',
    'tokenizer_config.json': 'https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion/resolve/main/tokenizer_config.json',
    'vocab.txt': 'https://huggingface.co/bhadresh-savani/distilbert-base-uncased-emotion/resolve/main/vocab.txt',
    'onnx/model.onnx': 'https://huggingface.co/Gladiaio/bhadresh-savani_distilbert-base-uncased-emotion_onnx/resolve/main/bhadresh-savani_distilbert-base-uncased-emotion_onnx_model/1/model.bin'
};

// Модель перевода (Opus RU-EN)
const TRANSLATOR_DIR = 'Xenova/opus-mt-ru-en'; 
const TRANSLATOR_URLS = {
    'config.json': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/config.json',
    'tokenizer.json': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/tokenizer.json',
    'tokenizer_config.json': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/tokenizer_config.json',
    'generation_config.json': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/generation_config.json',
    'onnx/encoder_model_quantized.onnx': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/onnx/encoder_model_quantized.onnx',
    'onnx/decoder_model_merged_quantized.onnx': 'https://huggingface.co/Xenova/opus-mt-ru-en/resolve/main/onnx/decoder_model_merged_quantized.onnx'
};

// --- ФУНКЦИИ ---

async function downloadFile(url, destPath) {
    const parentDir = path.dirname(destPath);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
    }

    if (fs.existsSync(destPath)) {
        console.log(`- ✅ ${path.basename(destPath)} уже существует`);
        return;
    }

    console.log(`- ⏳ Загрузка ${url}...`);
    try {
        const response = await fetch(url, { redirect: 'follow' });
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        fs.writeFileSync(destPath, buffer);
        console.log(`- ✨ Сохранено в ${destPath}`);
    } catch (e) {
        console.error(`- ❌ Ошибка при загрузке ${url}: ${e.message}`);
    }
}

async function downloadModel(modelDir, filesMap) {
    console.log(`\n📦 Подготовка модели: ${modelDir}`);
    const basePath = path.join(MODELS_ROOT, modelDir);
    
    for (const [fileName, url] of Object.entries(filesMap)) {
        const dest = path.join(basePath, ...fileName.split('/'));
        await downloadFile(url, dest);
    }
}

async function main() {
    console.log('🚀 Запуск загрузки локальных AI-моделей...');
    
    try {
        // Качаем классификатор
        await downloadModel(CLASSIFIER_DIR, CLASSIFIER_URLS);
        
        // Качаем переводчик
        await downloadModel(TRANSLATOR_DIR, TRANSLATOR_URLS);
        
        console.log('\n✅ Все файлы моделей готовы! Теперь приложение будет работать полностью локально.');
    } catch (e) {
        console.error('\n❌ Критическая ошибка:', e);
    }
}

main();
