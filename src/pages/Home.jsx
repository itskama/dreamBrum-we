import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import LocalDreamAnalyzer from '../components/LocalDreamAnalyzer';
import DreamArchive from '../components/DreamArchive';

export default function Home() {
    return (
        <main>
            <Hero />
            <Features />
            <LocalDreamAnalyzer />
            <DreamArchive />
        </main>
    );
}
