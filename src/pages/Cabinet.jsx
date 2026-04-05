import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';

export default function Cabinet() {
    const { currentUser, userSettings, updateSettings, changePassword, removeAccount, logout } = useAuth();
    const navigate = useNavigate();
    
    const [history, setHistory] = useState([]);
    const [newPassword, setNewPassword] = useState('');
    const [lang, setLang] = useState(userSettings?.language || 'ru');
    const [saveHist, setSaveHist] = useState(userSettings?.saveHistory ?? true);
    
    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        
        async function fetchHistory() {
            const snapshot = await get(child(ref(db), `users/${currentUser.uid}/history`));
            if (snapshot.exists()) {
                const data = snapshot.val();
                if (data && typeof data === 'object') {
                    setHistory(Object.values(data));
                } else if (Array.isArray(data)) {
                    setHistory(data);
                }
            }
        }
        fetchHistory();
    }, [currentUser, navigate]);

    async function handleSaveSettings() {
        await updateSettings({ language: lang, saveHistory: saveHist });
        alert('Настройки сохранены');
    }

    async function handleChangePassword() {
        if (newPassword) {
            try {
                await changePassword(newPassword);
                alert('Пароль успешно изменен');
                setNewPassword('');
            } catch (err) {
                alert('Ошибка смены пароля: ' + err.message);
            }
        }
    }

    async function handleDeleteAccount() {
        if (window.confirm('Вы уверены, что хотите удалить аккаунт?')) {
            try {
                await removeAccount();
                navigate('/');
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    // Рассчитываем Топ-3
    const emotionsCount = {};
    history.forEach(item => {
        if (item.mainEmotion) {
            emotionsCount[item.mainEmotion] = (emotionsCount[item.mainEmotion] || 0) + 1;
        }
    });
    const topEmotions = Object.entries(emotionsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    return (
        <Container style={{ marginTop: '100px', minHeight: '60vh' }}>
            <h2 className="section-title">Личный кабинет</h2>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <p>Email: {currentUser?.email}</p>
                <Button onClick={handleLogout} variant="secondary">Выйти</Button>
            </div>

            <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div style={{ flex: '1', minWidth: '300px', background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
                    <h3>Настройки профиля</h3>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Язык интерфейса:</label>
                        <select value={lang} onChange={(e) => setLang(e.target.value)} style={{ padding: '8px', borderRadius: '5px', width: '100%' }}>
                            <option value="ru">Русский</option>
                            <option value="en">English</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input type="checkbox" checked={saveHist} onChange={(e) => setSaveHist(e.target.checked)} />
                            Сохранять историю
                        </label>
                    </div>
                    <Button onClick={handleSaveSettings}>Сохранить настройки</Button>

                    <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />
                    
                    <h3>Безопасность</h3>
                    <input 
                        type="password" 
                        placeholder="Новый пароль" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        style={{ padding: '8px', borderRadius: '5px', width: '100%', marginBottom: '10px' }}
                    />
                    <Button onClick={handleChangePassword} style={{ marginBottom: '10px', width: '100%' }}>Сменить пароль</Button>
                    <Button onClick={handleDeleteAccount} variant="secondary" style={{ width: '100%', color: 'red' }}>Удалить аккаунт</Button>
                </div>

                <div style={{ flex: '2', minWidth: '300px', background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
                    <h3>Статистика (Топ-3 эмоции)</h3>
                    {topEmotions.length > 0 ? (
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {topEmotions.map((e, i) => (
                                <li key={i} style={{ marginBottom: '5px' }}>
                                    {i + 1}. {e[0]} — {e[1]} раз(а)
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Нет данных для статистики</p>
                    )}

                    <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

                    <h3>Мои записи (История)</h3>
                    {history.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {history.map((record, index) => (
                                <div key={index} style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                                    <p style={{ margin: '0 0 5px 0' }}>{record.text.substring(0, 50)}...</p>
                                    <small style={{ color: 'var(--text-secondary)' }}>
                                        {record.date} | Главная эмоция: {record.mainEmotion}
                                    </small>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>История пуста</p>
                    )}
                </div>
            </div>
        </Container>
    );
}
