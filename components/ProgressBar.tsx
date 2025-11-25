'use client';

interface ProgressBarProps {
    progress: number;
    label?: string;
}

export default function ProgressBar({ progress, label }: ProgressBarProps) {
    return (
        <div className="w-full animate-fade-in">
            {label && <p className="text-sm font-medium text-gray-700 mb-3">{label}</p>}
            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                <div
                    className="h-full transition-all duration-500 ease-out rounded-full bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 relative overflow-hidden"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                        style={{ backgroundSize: '200% 100%', animation: 'shimmer 2s infinite' }} />
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs font-semibold text-blue-600">{Math.round(progress)}%</p>
                <p className="text-xs text-gray-500">Processing...</p>
            </div>
        </div>
    );
}
