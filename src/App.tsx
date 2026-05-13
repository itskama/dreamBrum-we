import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Cabinet from './pages/Cabinet';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Library from './pages/Library';
import Header from './components/Header';
import './App.css';

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="app">
      {!isLoginPage && <Header />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cabinet" element={<Cabinet />} />
        <Route path="/library" element={<Library />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </div>
  );
}

export default App;
