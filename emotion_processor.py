import logging
from typing import Dict, Any, List
from langdetect import detect, DetectorFactory
from transformers import pipeline

# Устанавливаем seed для стабильности детекции языка
DetectorFactory.seed = 42

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EmotionProcessor:
    def __init__(self, emotion_model_name: str = "bhadresh-savani/distilbert-base-uncased-emotion", 
                 translation_model_name: str = "Helsinki-NLP/opus-mt-ru-en"):
        """
        Инициализация моделей. 
        emotion_model_name: Модель для определения эмоций (на английском)
        translation_model_name: Модель для перевода с русского на английский
        """
        logger.info("Загрузка моделей... Это может занять некоторое время при первом запуске.")
        
        try:
            # Модель анализа эмоций (DistilBERT)
            self.emotion_classifier = pipeline(
                "text-classification", 
                model=emotion_model_name, 
                return_all_scores=True
            )
            
            # Модель перевода (RU -> EN)
            self.translator = pipeline(
                "translation_ru_to_en", 
                model=translation_model_name
            )
            
            logger.info("Модели успешно загружены.")
        except Exception as e:
            logger.error(f"Ошибка при загрузке моделей: {e}")
            raise

    def is_cyrillic(self, text: str) -> bool:
        """Проверяет, содержит ли текст кириллические символы"""
        return any(u'\u0400' <= c <= u'\u04FF' for c in text)

    def detect_language(self, text: str) -> str:
        """Определяет язык текста (ru или en) с учетом кириллицы"""
        # Если есть кириллица, с высокой вероятностью это русский или похожий язык
        if self.is_cyrillic(text):
            return "ru"
            
        try:
            lang = detect(text)
            return lang
        except Exception as e:
            logger.warning(f"Не удалось определить язык для текста: {text[:30]}... Ошибка: {e}")
            return "unknown"

    def translate_if_needed(self, text: str, lang: str) -> str:
        """Переводит текст на английский, если он на русском"""
        if lang == 'ru':
            logger.info("Обнаружен русский язык. Перевожу на английский...")
            try:
                translation = self.translator(text)
                translated_text = translation[0]['translation_text']
                logger.debug(f"Перевод: {translated_text}")
                return translated_text
            except Exception as e:
                logger.error(f"Ошибка перевода: {e}")
                # Если перевод не сработал, возвращаем оригинал (может быть fallback)
                return text
        return text

    def analyze_emotions(self, text: str) -> Dict[str, Any]:
        """
        Основной метод: детекция языка -> (перевод) -> анализ эмоций
        """
        result = {
            "original_text": text,
            "detected_language": "unknown",
            "processed_text": text,
            "emotions": [],
            "status": "success",
            "error": None
        }

        try:
            if not text or not isinstance(text, str):
                raise ValueError("Текст должен быть непустой строкой")

            # 1. Детекция языка
            lang = self.detect_language(text)
            result["detected_language"] = lang

            # 2. Обработка (перевод если нужно)
            # Если не ru и не en, все равно пробуем как есть, или можно добавить логику
            processed_text = self.translate_if_needed(text, lang)
            result["processed_text"] = processed_text

            # 3. Анализ эмоций (всегда на "английском" или переведенном тексте)
            emotions_output = self.emotion_classifier(processed_text)
            
            # Форматируем вывод: сортируем по весу (вероятности)
            formatted_emotions = sorted(
                emotions_output[0], 
                key=lambda x: x['score'], 
                reverse=True
            )
            result["emotions"] = formatted_emotions

        except Exception as e:
            logger.error(f"Ошибка во время обработки: {e}")
            result["status"] = "error"
            result["error"] = str(e)
            
        return result

# --- Пример использования ---
if __name__ == "__main__":
    # Инициализация процессора
    try:
        processor = EmotionProcessor()

        test_samples = [
            "I am so happy that everything worked out!", # English
            "Я очень расстроен из-за того, что произошло вчера.", # Russian
            "Это было просто невероятно и удивительно!", # Russian (surprise)
            "I feel a bit anxious about the upcoming exam.", # English
            "" # Empty string for error handling test
        ]

        print("\n" + "="*50)
        print("РЕЗУЛЬТАТЫ АНАЛИЗА ЭМОЦИЙ")
        print("="*50)

        for sample in test_samples:
            res = processor.analyze_emotions(sample)
            
            print(f"\nТекст: {res['original_text']}")
            print(f"Язык: {res['detected_language']}")
            
            if res['status'] == 'success':
                main_emotion = res['emotions'][0]
                print(f"Обработанный текст: {res['processed_text']}")
                print(f"Главная эмоция: {main_emotion['label']} ({main_emotion['score']:.2%})")
                
                # Вывод топ-3 эмоций
                print("Топ-3 эмоции: ", end="")
                top_3 = [f"{e['label']}: {e['score']:.2%}" for e in res['emotions'][:3]]
                print(", ".join(top_3))
            else:
                print(f"ОШИБКА: {res['error']}")
            
            print("-" * 30)
            
    except KeyboardInterrupt:
        print("\nПрограмма остановлена пользователем.")
    except Exception as e:
        print(f"Критическая ошибка: {e}")
