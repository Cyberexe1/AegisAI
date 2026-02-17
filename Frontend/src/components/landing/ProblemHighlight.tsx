import React from 'react';
import { motion } from 'framer-motion';
import { Activity, GitPullRequest, EyeOff, ShieldAlert, FileWarning } from 'lucide-react';

const ProblemHighlight = () => {
    const problems = [
        {
            icon: <Activity className="w-6 h-6 text-orange-500" />,
            title: "Fragmented AI Monitoring",
            description: "Disjointed tools for ML performance, infrastructure, and compliance leave critical gaps."
        },
        {
            icon: <EyeOff className="w-6 h-6 text-orange-500" />,
            title: "No Cross-System Visibility",
            description: "Risk propagates unnoticed between isolated models and downstream applications."
        },
        {
            icon: <GitPullRequest className="w-6 h-6 text-orange-500" />,
            title: "Uncontrolled Autonomy",
            description: "LLM agents taking actions without enforced governance boundaries."
        },
        {
            icon: <ShieldAlert className="w-6 h-6 text-orange-500" />,
            title: "Reactive Oversight",
            description: "Human intervention happens only after incidents occur, not preventatively."
        },
        {
            icon: <FileWarning className="w-6 h-6 text-orange-500" />,
            title: "Regulatory Exposure",
            description: "Inability to prove compliance with EU AI Act and banking regulations."
        }
    ];

    return (
        <section className="py-24 bg-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="mb-16 max-w-3xl">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6 text-primary">
                        The Silent Risk in <span className="text-orange-500">Modern Banking AI</span>
                    </h2>
                    <p className="text-xl text-secondary leading-relaxed">
                        Modern banks deploy multiple AI systems — credit scoring models, fraud detection, and explanation agents — but they operate in silos. Without unified governance, risk creates systemic vulnerabilities.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {problems.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-orange-100 transition-all duration-300"
                        >
                            <div className="mb-6 w-14 h-14 rounded-xl bg-orange-50 flex items-center justify-center group-hover:bg-orange-500/10 transition-colors">
                                {item.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-primary">{item.title}</h3>
                            <p className="text-secondary leading-relaxed">{item.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProblemHighlight;
