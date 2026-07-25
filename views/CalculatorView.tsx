import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { FeatureType } from '../types';
import ViewContainer from '../components/ViewContainer';

interface MoreViewProps {
    onSelectFeature: (feature: FeatureType, origin?: { x: number, y: number }) => void;
}

const FeatureCard: React.FC<{
    icon: string;
    title: string;
    description: string;
    onClick: (e: React.MouseEvent) => void;
    color: string;
}> = ({ icon, title, description, onClick, color }) => {
    return (
        <button
            onClick={onClick}
            className={`group relative text-left w-full p-6 bg-slate-100 dark:bg-slate-700 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border-t-4 ${color}`}
        >
            <div className="flex items-start gap-4">
                 <div className={`text-3xl p-4 rounded-full bg-opacity-10 ${color.replace('border-', 'bg-').replace('dark:border-', 'dark:bg-')} ${color.replace('border-', 'text-').replace('dark:border-', 'dark:text-')}`}>
                    <i className={icon}></i>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
                </div>
            </div>
             <div className="absolute top-4 right-4 text-gray-300 dark:text-gray-600 group-hover:text-slate-500 transition-colors">
                <i className="fas fa-arrow-right"></i>
            </div>
        </button>
    );
};

const MoreView: React.FC<MoreViewProps> = ({ onSelectFeature }) => {
    const { t } = useLanguage();

    // Reordered as per user request for simplified interaction.
    const features = [
        {
            type: FeatureType.Savings,
            icon: 'fas fa-piggy-bank',
            title: t('savings'),
            description: t('savingsDescription'),
            color: 'border-green-500'
        },
        {
            type: FeatureType.Loans,
            icon: 'fas fa-hand-holding-usd',
            title: t('loans'),
            description: t('loansDescription'),
            color: 'border-yellow-500'
        },
        {
            type: FeatureType.Investments,
            icon: 'fas fa-chart-line',
            title: t('investments'),
            description: t('investmentsDescription'),
            color: 'border-blue-500'
        },
        {
            type: FeatureType.Reports,
            icon: 'fas fa-file-invoice-dollar',
            title: t('reports'),
            description: t('reportsDescription'),
            color: 'border-teal-500'
        },
        {
            type: FeatureType.Subscriptions,
            icon: 'fas fa-sync-alt',
            title: t('subscriptions'),
            description: t('subscriptionsDescription'),
            color: 'border-indigo-500'
        },
        {
            type: FeatureType.Scheduled,
            icon: 'fas fa-calendar-alt',
            title: t('scheduled'),
            description: t('scheduledDescription'),
            color: 'border-orange-500'
        },
        {
            type: FeatureType.ActivityLog,
            icon: 'fas fa-book-open',
            title: t('activityLog'),
            description: t('activityLogDescription'),
            color: 'border-cyan-500'
        }
    ];

    return (
        <ViewContainer title={t('more')} icon="fas fa-layer-group">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map(feature => (
                    <FeatureCard
                        key={feature.type}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        color={feature.color}
                        onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            onSelectFeature(feature.type, {
                                x: rect.left + rect.width / 2,
                                y: rect.top + rect.height / 2
                            });
                        }}
                    />
                ))}
            </div>

            <div className="mt-16 mb-24 flex justify-center w-full">
                <div className="relative p-8 rounded-3xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] text-center w-full max-w-sm overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-400/5 dark:to-teal-400/5 transition-opacity duration-500 opacity-0 group-hover:opacity-100"></div>
                    
                    <h2 className="relative text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 mb-2 drop-shadow-sm">
                        WALLET
                    </h2>
                    
                    <div className="relative inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
                        <span className="text-[10px] uppercase font-mono font-semibold tracking-widest text-slate-500 dark:text-slate-400">
                            Version 1.0 <span className="text-slate-400 dark:text-slate-500">(Build 2026)</span>
                        </span>
                    </div>
                    
                    <div className="relative flex items-center justify-center gap-3 text-xs tracking-widest uppercase">
                        <span className="h-px w-6 bg-gradient-to-r from-transparent to-slate-300 dark:to-slate-600"></span>
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                            Designed by <span className="font-bold text-slate-800 dark:text-slate-200">Menkir</span>
                        </span>
                        <span className="h-px w-6 bg-gradient-to-l from-transparent to-slate-300 dark:to-slate-600"></span>
                    </div>
                </div>
            </div>
        </ViewContainer>
    );
};

export default MoreView;