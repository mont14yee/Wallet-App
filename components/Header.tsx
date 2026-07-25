
import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ViewType, FeatureType, UserProfile } from '../types';

interface HeaderProps {
    activeView: ViewType;
    userProfile?: UserProfile;
    onSelectFeature?: (feature: FeatureType, origin?: { x: number, y: number }) => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, userProfile, onSelectFeature }) => {
    const { t } = useLanguage();

    if (activeView === ViewType.Dashboard) {
        return (
            <header className="pt-12 pb-6 px-6 relative z-20 bg-transparent flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/50 shadow-md bg-gray-200 flex items-center justify-center">
                        {userProfile?.avatar ? (
                            <img src={userProfile.avatar} alt="User avatar" className="w-full h-full object-cover" />
                        ) : (
                            <i className="fas fa-user text-gray-400"></i>
                        )}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500 font-medium tracking-wide">{t('welcome') || 'Welcome'}</span>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">{userProfile?.name || 'Guest User'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button className="px-4 py-1.5 rounded-full border border-cyan-400 text-cyan-500 text-sm font-medium tracking-wide hover:bg-cyan-50 dark:hover:bg-cyan-900/30 transition-colors">
                        Add Card
                    </button>
                    <button className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <i className="far fa-bell"></i>
                    </button>
                </div>
            </header>
        );
    }

    return (
        <header className="pt-12 pb-6 px-6 relative z-20 bg-transparent flex items-center justify-between">
            <button className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => {/* Left to be handled by App router if needed */}}>
                 <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">{t(activeView)}</h1>
            <button className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                 <i className="fas fa-sliders-h text-sm"></i>
            </button>
        </header>
    );
};

export default Header;
