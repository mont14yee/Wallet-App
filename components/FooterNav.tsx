import React from 'react';
import { ViewType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NavItem {
    id: ViewType;
    icon: string;
    labelKey: 'home' | 'income' | 'expenses' | 'more' | 'invest';
}

const NAV_ITEMS: NavItem[] = [
    { id: ViewType.Dashboard, icon: 'fas fa-home', labelKey: 'home' },
    { id: ViewType.Expenses, icon: 'fas fa-credit-card', labelKey: 'expenses' },
    { id: ViewType.Income, icon: 'fas fa-wallet', labelKey: 'income' },
    { id: ViewType.Investments, icon: 'fas fa-chart-line', labelKey: 'invest' },
    { id: ViewType.More, icon: 'fas fa-chart-pie', labelKey: 'more' },
];

interface FooterNavProps {
    activeView: ViewType;
    setActiveView: (view: ViewType) => void;
}

const FooterNav: React.FC<FooterNavProps> = ({ activeView, setActiveView }) => {
    const { t } = useLanguage();
    
    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-6 pointer-events-none">
            <nav className="pointer-events-auto flex items-center justify-between px-3 py-3 w-full max-w-md bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/40 dark:border-gray-700/50">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`relative flex items-center justify-center transition-all duration-500 ease-out h-12 rounded-full focus:outline-none ${
                                isActive 
                                    ? 'w-auto px-5 bg-gradient-to-r from-purple-500 to-cyan-500 shadow-lg shadow-cyan-500/30' 
                                    : 'w-12 hover:bg-gray-100 dark:hover:bg-gray-800'
                            }`}
                            aria-label={t(item.labelKey)}
                        >
                            <i className={`${item.icon} text-lg transition-colors duration-300 ${
                                isActive ? 'text-white' : 'text-teal-600/80 dark:text-cyan-400/80'
                            }`}></i>
                            
                            {isActive && (
                                <span className="ml-2 text-sm font-semibold tracking-wide text-white uppercase whitespace-nowrap overflow-hidden animate-fadeIn">
                                    {t(item.labelKey)}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default FooterNav;