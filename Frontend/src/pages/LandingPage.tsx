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
                {/* Placeholder for other sections */}
                <section id="system-preview" className="py-24 border-t border-white/5 bg-gradient-to-b from-background to-surface/30">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold mb-8">System Preview</h2>
                        <div className="max-w-6xl mx-auto px-6">
                            <div className="relative rounded-xl border border-white/10 shadow-2xl overflow-hidden group">
                                <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none" />
                                {/* Placeholder for actual screenshot - using a styled div for now */}
                                <div className="bg-surface h-[500px] w-full flex flex-col items-center justify-center p-12">
                                    <div className="animate-pulse flex flex-col items-center space-y-4">
                                        <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                                        <p className="text-slate-400 font-mono">Loading Dashboard Simulation...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <Footer />
            </main>
        </div>
    );
};

export default LandingPage;
