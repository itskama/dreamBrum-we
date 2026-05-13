import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    deleteUser,
    User
} from 'firebase/auth';
import { ref, set, get, update, child } from 'firebase/database';

interface UserSettings {
  language: string;
  saveHistory: boolean;
  visualizationEnabled: boolean;
}

interface AuthContextType {
  currentUser: User | null;
  userSettings: UserSettings;
  signup: (email: string, password: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  removeAccount: () => Promise<void>;
  updateSettings: (settings: Partial<UserSettings>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [userSettings, setUserSettings] = useState<UserSettings>(() => {
        const savedLang = localStorage.getItem('guestLanguage');
        return { language: savedLang || 'en', saveHistory: true, visualizationEnabled: true };
    });

    async function signup(email: string, password: string) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await set(ref(db, 'users/' + result.user.uid), {
            email: email,
            role: 'user',
            settings: {
                language: userSettings.language,
                saveHistory: true,
                visualizationEnabled: true
            },
            history: []
        });
        return result;
    }

    function login(email: string, password: string) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function changePassword(newPassword: string) {
        if (!currentUser) throw new Error('No user logged in');
        return updatePassword(currentUser, newPassword);
    }

    async function removeAccount() {
        if (!currentUser) throw new Error('No user logged in');
        const uid = currentUser.uid;
        await set(ref(db, 'users/' + uid), null);
        return deleteUser(currentUser);
    }

    async function updateSettings(settings: Partial<UserSettings>) {
        if (currentUser) {
            try {
                await update(ref(db, 'users/' + currentUser.uid + '/settings'), settings);
            } catch (fbError) {
                console.error("Firebase update settings error:", fbError);
            }
        } else {
            if (settings.language) {
                localStorage.setItem('guestLanguage', settings.language);
            }
        }
        setUserSettings(prev => ({ ...prev, ...settings }));
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            setCurrentUser(user);
            if (user) {
                try {
                    const snapshot = await get(child(ref(db), `users/${user.uid}`));
                    if (snapshot.exists()) {
                        const data = snapshot.val();
                        setUserSettings({
                            language: 'en',
                            saveHistory: true,
                            visualizationEnabled: true,
                            ...data.settings
                        });
                    } else {
                        const defaultSettings = { language: 'en', saveHistory: true, visualizationEnabled: true };
                        setUserSettings(defaultSettings);
                        await set(ref(db, `users/${user.uid}/settings`), defaultSettings);
                    }
                } catch (fbError) {
                    console.error("Firebase auth settings fetch error:", fbError);
                    // Fallback to defaults if permission denied
                    setUserSettings({ language: 'en', saveHistory: true, visualizationEnabled: true });
                }
            } else {
                const savedLang = localStorage.getItem('guestLanguage');
                setUserSettings({ language: savedLang || 'en', saveHistory: true, visualizationEnabled: true });
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userSettings,
        signup,
        login,
        logout,
        changePassword,
        removeAccount,
        updateSettings
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
