import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updatePassword,
    deleteUser
} from 'firebase/auth';
import { ref, set, get, update, child } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userSettings, setUserSettings] = useState(null);

    async function signup(email, password) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create initial user info in DB
        await set(ref(db, 'users/' + result.user.uid), {
            email: email,
            role: 'user',
            settings: {
                language: 'ru',
                saveHistory: true
            },
            history: [] // We'll store dreams here or in a separate path
        });
        return result;
    }

    function login(email, password) {
        return signInWithEmailAndPassword(auth, email, password);
    }

    function logout() {
        return signOut(auth);
    }

    function changePassword(newPassword) {
        return updatePassword(currentUser, newPassword);
    }

    async function removeAccount() {
        const uid = currentUser.uid;
        await set(ref(db, 'users/' + uid), null);
        return deleteUser(currentUser);
    }

    async function updateSettings(settings) {
        await update(ref(db, 'users/' + currentUser.uid + '/settings'), settings);
        setUserSettings(prev => ({ ...prev, ...settings }));
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async user => {
            setCurrentUser(user);
            if (user) {
                // Fetch settings from db
                const snapshot = await get(child(ref(db), `users/${user.uid}`));
                if (snapshot.exists()) {
                    setUserSettings(snapshot.val().settings);
                } else {
                    setUserSettings({ language: 'ru', saveHistory: true });
                }
            } else {
                setUserSettings(null);
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
