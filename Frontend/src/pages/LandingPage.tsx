import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/landing/Hero';
import ProblemHighlight from '../components/landing/ProblemHighlight';
import SolutionOverview from '../components/landing/SolutionOverview';
import Footer from '../components/layout/Footer';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary/30">
            <Navbar />
            <main>
                <Hero />
                <ProblemHighlight />
                <SolutionOverview />
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;
