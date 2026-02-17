import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[50rem] h-[50rem] rounded-full bg-emerald-50 blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-accent rounded-xl text-primary mb-4">
                        <ShieldCheck className="w-10 h-10" />
                    </div>
                </div>

                <h2 className="text-3xl font-bold text-center text-primary mb-2">Join AegisAI Beta</h2>
                <p className="text-center text-secondary mb-8">Experience the future of AI Governance</p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-primary">Enterprise Security</h3>
                            <p className="text-sm text-secondary">Bank-grade encryption and access controls built-in.</p>
                        </div>
                    </div>
                    <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-primary">Full Traceability</h3>
                            <p className="text-sm text-secondary">Complete audit logs for every model decision and override.</p>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-secondary mb-4">Registration is currently invite-only.</p>
                    <Link
                        to="/login"
                        className="inline-flex items-center justify-center w-full py-4 bg-primary text-white rounded-xl font-bold hover:bg-green-900 transition-colors shadow-lg shadow-green-900/10"
                    >
                        Return to Login
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
