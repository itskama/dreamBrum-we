import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ref, get, child } from 'firebase/database';
import { db } from '../firebase';
import { translations } from '../translations';

const AdminPanel: React.FC = () => {
    const { currentUser, userSettings } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalDreams: 0 });
    const [permissionDenied, setPermissionDenied] = useState(false);
    const t = translations[userSettings?.language || 'ru'] || translations.ru;

    useEffect(() => {
        if (!currentUser) {
            navigate('/login');
            return;
        }

        async function fetchAdminData() {
            try {
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
            } catch (err: any) {
                console.error("Admin permission error:", err);
                if (err.message.includes('Permission denied')) {
                    setPermissionDenied(true);
                }
            }
        }

        fetchAdminData();
    }, [currentUser, navigate]);

    if (permissionDenied) {
        return (
            <div className="cabinet-container">
                <div className="container">
                    <div className="card">
                        <h2 className="login-title">{t.cabinet.accessDenied}</h2>
                        <p style={{ textAlign: 'center', color: 'var(--text-dark)', marginBottom: '24px' }}>
                            {t.cabinet.noPrivileges}
                        </p>
                        <button className="btn-purple" onClick={() => navigate('/cabinet')}>
                            {t.cabinet.returnCabinet}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-panel cabinet-container">
          <div className="container">
            <div className="card">
              <h2 className="card-title">Admin Dashboard</h2>
              
              <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                  <div className="stat-card" style={{ background: 'var(--blue)', color: 'white', padding: '24px', borderRadius: '15px' }}>
                      <h4 style={{ opacity: 0.9, marginBottom: '8px' }}>Total Users</h4>
                      <p style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.totalUsers}</p>
                  </div>
                  <div className="stat-card" style={{ background: 'var(--purple)', color: 'white', padding: '24px', borderRadius: '15px' }}>
                      <h4 style={{ opacity: 0.9, marginBottom: '8px' }}>Total Dream Records</h4>
                      <p style={{ fontSize: '2.5rem', fontWeight: '800' }}>{stats.totalDreams}</p>
                  </div>
              </div>

              <div className="users-table-container">
                  <h3 className="table-header" style={{ marginBottom: '20px', color: 'var(--text-dark)', fontWeight: '700' }}>System Users</h3>
                  <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', color: 'var(--text-dark)' }}>
                          <thead>
                              <tr style={{ borderBottom: '2px solid rgba(0,0,0,0.1)' }}>
                                  <th style={{ padding: '16px' }}>Email</th>
                                  <th style={{ padding: '16px' }}>Role</th>
                                  <th style={{ padding: '16px' }}>Dreams</th>
                                  <th style={{ padding: '16px' }}>Lang</th>
                              </tr>
                          </thead>
                          <tbody>
                              {users.map((u) => (
                                  <tr key={u.uid} style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                                      <td style={{ padding: '16px' }}>{u.email}</td>
                                      <td style={{ padding: '16px' }}>{u.role || 'user'}</td>
                                      <td style={{ padding: '16px' }}>{u.history ? Object.keys(u.history).length : 0}</td>
                                      <td style={{ padding: '16px' }}>{u.settings?.language}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              </div>
            </div>
          </div>
        </div>
    );
}

export default AdminPanel;
