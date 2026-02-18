import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, Home } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(email, password)) {
            if (email === 'user@agesai.com') {
                navigate('/user-dashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            setError('Invalid email or password. Please use the demo credentials.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] rounded-full bg-emerald-50 blur-[100px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-lime-50 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative z-10"
            >
                {/* Back to Homepage Button */}
                <div className="absolute top-4 left-4 z-20">
                    <Link
                        to="/"
                        className="flex items-center space-x-2 px-3 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg text-secondary hover:text-primary hover:border-primary transition-all shadow-sm hover:shadow-md group"
                    >
                        <Home className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-sm font-medium">Home</span>
                    </Link>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-primary rounded-xl text-white mb-4 shadow-lg shadow-green-900/20">
                            <ShieldCheck className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-primary">Welcome Back</h2>
                        <p className="text-secondary text-sm mt-1">Access your governance dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-primary"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-secondary mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-primary"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center justify-center">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-green-900 transition-all shadow-lg shadow-green-900/20 flex items-center justify-center space-x-2 group"
                        >
                            <span>Sign In to Dashboard</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-secondary">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-bold hover:underline">
                            Sign up for demo
                        </Link>
                    </div>
                </div>

                <div className="px-8 py-4 bg-slate-50 border-t border-gray-100 text-center text-xs text-gray-400">
                    <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200 mr-2">vikastiwari1045@gmail.com</span>
                    <span className="font-mono bg-white px-2 py-1 rounded border border-gray-200">Vikas123@</span>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
