import React from 'react';
import { ShieldCheck, Github, Twitter, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-2">
                        <div className="flex items-center space-x-2 mb-6">
                            <div className="p-1.5 bg-accent rounded-lg text-primary">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">AegisAI</span>
                        </div>
                        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed">
                            Unified AI governance and trust control platform for modern banking environments.
                            Ensuring compliance, safety, and reliability.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Github className="w-5 h-5 text-accent" />
                            </a>
                            <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Twitter className="w-5 h-5 text-accent" />
                            </a>
                            <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                <Linkedin className="w-5 h-5 text-accent" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Platform</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><a href="#" className="hover:text-accent transition-colors">Dashboard</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Risk Modeling</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Compliance API</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">System Status</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Team</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li>Problem Statement #42</li>
                            <li>Tech Stack: React, Python, FastAPI</li>
                            <li><a href="mailto:contact@aegisai.com" className="hover:text-accent transition-colors">contact@aegisai.com</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
                    <p>&copy; 2024 AegisAI Governance Platform. All rights reserved.</p>
                    <div className="flex space-x-8 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
