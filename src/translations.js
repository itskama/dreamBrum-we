export const translations = {
    ru: {
        nav: {
            home: "Главная",
            cabinet: "Личный кабинет",
            logout: "Выйти",
            login: "Войти"
        },
        cabinet: {
            title: "Личный кабинет",
            settings: "Настройки",
            language: "Язык интерфейса",
            saveHistory: "Сохранять историю снов",
            enableVisualization: "Генерация изображения сна",
            saveBtn: "Сохранить",
            statsTitle: "Фильтр по эмоциям",
            resetFilter: "Сбросить фильтр",
            noStats: "Здесь появится ваша статистика, когда вы проанализируете первый сон",
            loading: "Загрузка данных...",
            historyTitle: "Ваша история снов",
            historyFiltered: "Сны с эмоцией",
            noHistory: "История пока пустая",
            noFilteredHistory: "Снов с такой эмоцией пока не найдено",
            dreamsCount: "снов"
        },
        analyzer: {
            title: "🧠 Локальный AI-анализ",
            placeholder: "Например: I was flying over mountains, feeling free and happy...",
            analyzeBtn: "✨ Анализировать сон",
            analyzing: "🤔 Анализируем...",
            translating: "🌐 Переводим...",
            visualizing: "🎨 Рисуем твой сон...",
            results: "Результаты анализа:",
            mainEmotion: "Главная эмоция",
            lastAnalyzes: "Последние анализы",
            error: "Ошибка при анализе текста",
            inputError: "Введите описание сна",
            waitModel: "Модель ещё не загружена. Подождите...",
            modelReady: "✅ Система готова! Можно приступать к анализу.",
            modelLoading: "⏳ Загрузка модели...",
            modelLoadingCache: "⏳ Загружаем модель из кэша...",
            modelError: "❌ Ошибка загрузки модели",
            localModel: "🔬 Локальная модель:"
        },
        visualizer: {
            title: "✨ AI-визуализация",
            loading: "Рисуем твой сон...",
            error: "Не удалось создать изображение. Проверьте API ключ или лимиты.",
            download: "Скачать изображение",
            loginRequired: "Войдите, чтобы включить визуализацию"
        },
        hero: {
            title: "Превратите свои сны",
            titleGradient: " в видимые образы",
            subtitle: "DreamBrum — это AI-дневник, который сохраняет ваши сны, визуализирует их, а также анализирует эмоции, помогая замечать скрытые паттерны.",
            tryBtn: "Попробовать бесплатно",
            demoBtn: "Смотреть демо"
        },
        features: {
            title: "Возможности DreamBrum",
            subtitle: "Всё, что нужно для осознанного исследования своих сновидений",
            items: [
                {
                    title: 'Быстрая запись',
                    description: 'Голосовой или текстовый ввод сразу после пробуждения. Ни одна деталь не ускользнёт.'
                },
                {
                    title: 'AI-визуализация',
                    description: 'Нейросеть превращает ваше описание в уникальное изображение. Увидьте свой сон.'
                },
                {
                    title: 'Автоматический анализ',
                    description: 'Система сама находит повторяющиеся темы и символы, показывая скрытые паттерны.'
                },
                {
                    title: 'Умный архив',
                    description: 'Все сны хранятся как галерея образов. Легко найти любой момент.'
                }
            ]
        },
        footer: {
            description: "AI-дневник для визуализации и анализа сновидений",
            product: "Продукт",
            features: "Возможности",
            demo: "Демо",
            pricing: "Цены",
            resources: "Ресурсы",
            blog: "Блог",
            research: "Исследования",
            faq: "FAQ",
            company: "Компания",
            about: "О нас",
            contact: "Контакты",
            privacy: "Конфиденциальность",
            copyright: "© 2026 DreamBrum. Все права защищены."
        },
        emotions: {
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
        }
    },
    en: {
        nav: {
            home: "Home",
            cabinet: "Profile",
            logout: "Logout",
            login: "Login"
        },
        cabinet: {
            title: "Personal Account",
            settings: "Settings",
            language: "Interface Language",
            saveHistory: "Save dream history",
            saveBtn: "Save Settings",
            statsTitle: "Your Emotional State",
            resetFilter: "Reset filter",
            noStats: "Your statistics will appear here after your first analysis",
            loading: "Loading data...",
            historyTitle: "Your Dream History",
            historyFiltered: "Dreams with emotion",
            noHistory: "History is empty",
            noFilteredHistory: "No dreams found with this emotion",
            dreamsCount: "dreams"
        },
        analyzer: {
            title: "🧠 Local AI Analysis",
            placeholder: "Example: I was flying over mountains, feeling free and happy...",
            analyzeBtn: "✨ Analyze Dream",
            analyzing: "🤔 Analyzing...",
            translating: "🌐 Translating...",
            results: "Analysis Results:",
            mainEmotion: "Main Emotion",
            lastAnalyzes: "Recent Analyses",
            error: "Analysis error",
            inputError: "Please enter dream description",
            waitModel: "Model is loading. Please wait...",
            modelReady: "✅ System is ready! You can start analyzing.",
            modelLoading: "⏳ Loading model...",
            modelLoadingCache: "⏳ Loading model from cache...",
            modelError: "❌ Model loading error",
            localModel: "🔬 Local model:"
        },
        hero: {
            title: "Turn your dreams",
            titleGradient: " into visible images",
            subtitle: "DreamBrum is an AI-powered diary that not only saves your dreams but visualizes them, helping you uncover hidden patterns.",
            tryBtn: "Try for free",
            demoBtn: "Watch demo"
        },
        features: {
            title: "DreamBrum Features",
            subtitle: "Everything you need for conscious exploration of your dreams",
            items: [
                {
                    title: 'Quick Entry',
                    description: 'Voice or text input immediately after waking up. Not a single detail will escape.'
                },
                {
                    title: 'AI Visualization',
                    description: 'Neural network turns your description into a unique image. See your dream.'
                },
                {
                    title: 'Automatic Analysis',
                    description: 'The system itself finds recurring themes and symbols, showing hidden patterns.'
                },
                {
                    title: 'Smart Archive',
                    description: 'All dreams are stored as an image gallery. Easy to find any moment.'
                }
            ]
        },
        footer: {
            description: "AI-powered diary for dream visualization and analysis",
            product: "Product",
            features: "Features",
            demo: "Demo",
            pricing: "Pricing",
            resources: "Resources",
            blog: "Blog",
            research: "Research",
            faq: "FAQ",
            company: "Company",
            about: "About Us",
            contact: "Contacts",
            privacy: "Privacy Policy",
            copyright: "© 2026 DreamBrum. All rights reserved."
        },
        emotions: {
            joy: 'Joy',
            sadness: 'Sadness',
            anger: 'Anger',
            fear: 'Fear',
            love: 'Love',
            surprise: 'Surprise',
            disgust: 'Disgust',
            neutral: 'Neutral',
            positive: 'Positive',
            negative: 'Negative'
        }
    }
};
