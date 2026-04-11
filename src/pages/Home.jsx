import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Hero from '../components/Hero';
import Features from '../components/Features';
import LocalDreamAnalyzer from '../components/LocalDreamAnalyzer';
import DreamArchive from '../components/DreamArchive';

export default function Home() {
    const { currentUser } = useAuth();

    return (
        <main>
            {!currentUser && (
                <>
                    <Hero />
                    <Features />
                </>
            )}
            <LocalDreamAnalyzer />
            <DreamArchive />
        </main>
    );
}
