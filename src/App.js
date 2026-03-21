import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import LocalDreamAnalyzer from './components/LocalDreamAnalyzer'; // новый компонент
import DreamArchive from './components/DreamArchive';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="app">
      <Header isLoggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />
      <main>
        <Hero />
        <Features />
        <LocalDreamAnalyzer /> {/* заменили на локальный */}
        <DreamArchive />
      </main>
      <Footer />
    </div>
  );
}

export default App;