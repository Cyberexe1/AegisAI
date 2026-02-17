import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Activity, Network, Sliders, Users } from 'lucide-react';

const SolutionOverview = () => {
    const features = [
        {
            icon: <ShieldCheck className="w-8 h-8 text-primary" />,
            title: "Model Contract Authorization",
            description: "Enforce strict contracts for input/output behavior before model deployment."
        },
        {
            icon: <Activity className="w-8 h-8 text-primary" />,
            title: "Behavioral Baseline Monitoring",
            description: "Detect deviations in model behavior, not just performance metrics."
        },
        {
            icon: <Network className="w-8 h-8 text-primary" />,
            title: "Risk Propagation Graph",
            description: "Visualize and predict how failure in one node impacts the entire system."
        },
        {
            icon: <Sliders className="w-8 h-8 text-primary" />,
            title: "Dynamic Trust Engine",
            description: "Real-time scoring that adjusts autonomy levels based on risk."
        },
        {
            icon: <Users className="w-8 h-8 text-primary" />,
            title: "Human-in-the-Loop Arbitration",
            description: "Seamless escalation protocols for high-risk decisions."
        }
    ];

    return (
        <section className="py-24 bg-slate-50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary">
                        Enforceable Governance <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-700">Not Passive Observability</span>
                    </h2>
                    <p className="text-xl text-secondary">
                        AegisAI introduces a unified governance control plane that integrates behavioral monitoring, risk modeling, and measurable human oversight.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="p-8 rounded-2xl bg-white border border-gray-200 hover:border-emerald-200 hover:shadow-lg transition-all group"
                        >
                            <div className="mb-6 p-4 rounded-xl bg-green-50 w-fit group-hover:bg-accent/40 transition-colors">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary">{feature.title}</h3>
                            <p className="text-secondary leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SolutionOverview;
