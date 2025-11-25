'use client';

import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    onClick: () => void;
}

export default function FeatureCard({ icon: Icon, title, description, onClick }: FeatureCardProps) {
    return (
        <button
            onClick={onClick}
            className="group relative p-8 glass rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-blue-300 hover:-translate-y-2 text-left w-full overflow-hidden"
            aria-label={`Open ${title} tool`}
        >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex flex-col items-start gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}
