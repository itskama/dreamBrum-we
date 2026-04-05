import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, signup } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isRegister) {
                await signup(email, password);
            } else {
                await login(email, password);
            }
            navigate('/cabinet');
        } catch (err) {
            setError(err.message || 'Ошибка 인증');
        }
        setLoading(false);
    }

    return (
        <Container style={{ marginTop: '100px', minHeight: '60vh' }}>
            <h2 className="section-title">{isRegister ? 'Регистрация' : 'Вход'}</h2>
            <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
                {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Email"
                        style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <input 
                        type="password" 
                        required 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Пароль"
                        style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                    <Button disabled={loading} type="submit" size="large">
                        {isRegister ? 'Зарегистрироваться' : 'Войти'}
                    </Button>
                </form>
                <div style={{ marginTop: '20px' }}>
                    <Button variant="secondary" onClick={() => setIsRegister(!isRegister)}>
                        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
                    </Button>
                </div>
            </div>
        </Container>
    );
}
