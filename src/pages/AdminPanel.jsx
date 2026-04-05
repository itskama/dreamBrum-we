import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';

export default function AdminPanel() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalDreams: 0 });

    useEffect(() => {
        // Here normally we check if currentUser.role === 'admin'
        // For demonstration, we allow accessing or checking.
        if (!currentUser) {
            navigate('/login');
            return;
        }

        async function fetchAdminData() {
            try {
                // To fetch all users, admin needs DB rules permissions
                const snapshot = await get(child(ref(db), `users`));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const usersArray = Object.keys(data).map(uid => ({
                        uid,
                        ...data[uid]
                    }));
                    setUsers(usersArray);
                    
                    let totalDreams = 0;
                    usersArray.forEach(u => {
                        if (u.history) {
                            totalDreams += Object.keys(u.history).length;
                        }
                    });
                    
                    setStats({
                        totalUsers: usersArray.length,
                        totalDreams
                    });
                }
            } catch (err) {
                console.error("No admin permission or error:", err);
            }
        }

        fetchAdminData();
    }, [currentUser, navigate]);

    return (
        <Container style={{ marginTop: '100px', minHeight: '60vh' }}>
            <h2 className="section-title">Панель администратора</h2>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={{ flex: '1', background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
                    <h3>Всего пользователей</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalUsers}</p>
                </div>
                <div style={{ flex: '1', background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
                    <h3>Всего записей снов</h3>
                    <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{stats.totalDreams}</p>
                </div>
            </div>

            <div style={{ background: 'var(--card-bg)', padding: '20px', borderRadius: '15px' }}>
                <h3>Пользователи системы</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Роль</th>
                                <th style={{ padding: '10px' }}>Снов сохранено</th>
                                <th style={{ padding: '10px' }}>Язык</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u, i) => (
                                <tr key={u.uid} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px' }}>{u.email}</td>
                                    <td style={{ padding: '10px' }}>{u.role || 'user'}</td>
                                    <td style={{ padding: '10px' }}>{u.history ? Object.keys(u.history).length : 0}</td>
                                    <td style={{ padding: '10px' }}>{u.settings?.language}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Container>
    );
}
