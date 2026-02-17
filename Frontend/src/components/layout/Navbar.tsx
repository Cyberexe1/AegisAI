import React, { useState, useEffect } from 'react';
import { ShieldCheck, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
            }`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-primary">
                    <div className="p-1.5 bg-primary rounded-lg text-white">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-primary">AegisAI</span>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-secondary">
                    <a href="#features" className="hover:text-primary transition-colors">Features</a>
                    <a href="#system-preview" className="hover:text-primary transition-colors">System Preview</a>
                    <a href="#" className="hover:text-primary transition-colors">Solutions</a>
                    <a href="#" className="hover:text-primary transition-colors">Pricing</a>
                </div>

                <div className="hidden md:flex items-center space-x-4">
                    <Link
                        to="/dashboard"
                        className="text-primary font-medium hover:text-green-800 transition-colors"
                    >
                        Log in
                    </Link>
                    <Link
                        to="/dashboard"
                        className="px-5 py-2.5 rounded-lg bg-primary hover:bg-green-900 text-white font-medium transition-all shadow-lg shadow-green-900/20"
                    >
                        Launch Console
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button
                    className="md:hidden text-primary"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="absolute top-full left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col space-y-4 md:hidden shadow-lg">
                    <a href="#features" className="text-secondary hover:text-primary font-medium">Features</a>
                    <a href="#system-preview" className="text-secondary hover:text-primary font-medium">System Preview</a>
                    <Link to="/dashboard" className="w-full py-3 text-center rounded-lg bg-primary text-white font-medium">
                        Launch Console
                    </Link>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
