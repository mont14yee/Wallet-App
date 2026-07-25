import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile } from '../../types';

// ==================================================================
// Shared Premium Components
// ==================================================================

interface SettingsSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
    <div className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 overflow-hidden">
        <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-gray-100 dark:border-gray-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <i className={`${icon} text-sm`}></i>
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">{title}</h2>
        </div>
        <div className="flex flex-col">
            {children}
        </div>
    </div>
);

interface SettingsRowProps {
    label: string;
    subLabel?: string;
    children: React.ReactNode;
    onClick?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, subLabel, children, onClick }) => (
    <div 
        onClick={onClick}
        className={`px-5 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 dark:border-gray-700/30 last:border-0 transition-colors ${onClick ? 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30' : ''}`}
    >
        <div className="flex flex-col">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
            {subLabel && <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subLabel}</span>}
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

// ==================================================================
// Settings Content
// ==================================================================

interface SettingsProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsContent: React.FC<SettingsProps> = ({ theme, setTheme }) => {
    const { t, language, setLanguage, currencySettings, setCurrencySettings } = useLanguage();
    const [appLockEnabled, setAppLockEnabled] = useState(false);
    const [billReminders, setBillReminders] = useState(true);
    const [targetMilestones, setTargetMilestones] = useState(true);
    const [largeTransactions, setLargeTransactions] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const ToggleSwitch: React.FC<{isOn: boolean; onToggle: () => void; id: string}> = ({ isOn, onToggle, id }) => (
        <button onClick={onToggle} id={id} className={`relative inline-flex items-center h-7 rounded-full w-12 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-gray-900 ${isOn ? 'bg-gradient-to-r from-purple-500 to-cyan-500' : 'bg-gray-200 dark:bg-gray-700'}`}>
            <span className={`inline-block w-5 h-5 transform bg-white rounded-full transition-transform duration-300 shadow-sm ${isOn ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    const selectClasses = "w-full sm:w-auto bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-cyan-500/50 text-sm font-medium text-gray-700 dark:text-gray-200";
    const inputClasses = "w-full sm:w-24 bg-transparent border border-gray-200 dark:border-gray-600 rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:focus:ring-cyan-500/50 text-sm font-medium text-gray-700 dark:text-gray-200 text-center";

    return (
        <div className="pb-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('settings') || 'Settings'}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your app preferences and configurations.</p>
            </div>

            <SettingsSection title={t('sidebarAppearance')} icon="fas fa-paint-brush">
                <SettingsRow label={t('sidebarDarkMode')} subLabel="Switch between light and dark themes">
                    <ToggleSwitch isOn={theme === 'dark'} onToggle={() => setTheme(theme === 'light' ? 'dark' : 'light')} id="darkModeToggle" />
                </SettingsRow>
            </SettingsSection>

            <SettingsSection title={t('sidebarLanguage')} icon="fas fa-language">
                <div className="p-5 sm:p-6">
                    <div className="flex bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl p-1 border border-gray-200/50 dark:border-gray-700/50">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${language === 'en' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-cyan-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('am')}
                            className={`flex-1 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${language === 'am' ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-cyan-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                        >
                            አማርኛ
                        </button>
                    </div>
                </div>
            </SettingsSection>

            <SettingsSection title={t('sidebarCurrency')} icon="fas fa-coins">
                <SettingsRow label={t('sidebarCurrencySymbol')} subLabel="Set your preferred currency symbol">
                    <input type="text" id="currencySymbol" value={currencySettings.symbol} onChange={(e) => setCurrencySettings({ symbol: e.target.value })} className={inputClasses} placeholder="$, €, ETB"/>
                </SettingsRow>
                <SettingsRow label={t('sidebarSymbolPlacement')} subLabel="Position of the currency symbol">
                    <select id="symbolPlacement" value={currencySettings.symbolPlacement} onChange={(e) => setCurrencySettings({ symbolPlacement: e.target.value as 'before' | 'after' })} className={selectClasses}>
                        <option value="before">{t('sidebarSymbolBefore')} ({currencySettings.symbol}100)</option>
                        <option value="after">{t('sidebarSymbolAfter')} (100{currencySettings.symbol})</option>
                    </select>
                </SettingsRow>
                <SettingsRow label={t('sidebarNumberFormat')} subLabel="Format for numbers and decimals">
                    <select id="numberFormat" value={currencySettings.numberFormat} onChange={(e) => setCurrencySettings({ numberFormat: e.target.value as any })} className={selectClasses}>
                        <option value="comma-dot">1,234.56</option>
                        <option value="dot-comma">1.234,56</option>
                        <option value="space-dot">1 234.56</option>
                    </select>
                </SettingsRow>
                <SettingsRow label={t('sidebarDecimalPlaces')} subLabel="Number of decimal digits to display">
                    <input type="number" id="decimalPlaces" min="0" max="6" value={currencySettings.decimalPlaces} onChange={(e) => { const val = parseInt(e.target.value, 10); if (!isNaN(val)) { setCurrencySettings({ decimalPlaces: val }) } }} className={inputClasses} />
                </SettingsRow>
            </SettingsSection>

            <SettingsSection title={t('sidebarNotifications')} icon="fas fa-bell">
                <SettingsRow label={t('sidebarBillReminders')} subLabel="Get notified about upcoming bills">
                    <ToggleSwitch isOn={billReminders} onToggle={() => setBillReminders(!billReminders)} id="billRemindersToggle" />
                </SettingsRow>
                <SettingsRow label={t('sidebarTargetMilestones')} subLabel="Alerts when you reach savings goals">
                    <ToggleSwitch isOn={targetMilestones} onToggle={() => setTargetMilestones(!targetMilestones)} id="targetMilestonesToggle" />
                </SettingsRow>
                <SettingsRow label={t('sidebarLargeTransactions')} subLabel="Alerts for transactions over a certain amount">
                    <ToggleSwitch isOn={largeTransactions} onToggle={() => setLargeTransactions(!largeTransactions)} id="largeTransactionsToggle" />
                </SettingsRow>
            </SettingsSection>

            <SettingsSection title={t('sidebarSecurity')} icon="fas fa-shield-alt">
                <SettingsRow label={t('sidebarAppLock')} subLabel="Require authentication to open the app">
                    <ToggleSwitch isOn={appLockEnabled} onToggle={() => setAppLockEnabled(!appLockEnabled)} id="appLockToggle" />
                </SettingsRow>
                {appLockEnabled && (
                    <>
                        <SettingsRow label={t('sidebarChangePIN')} onClick={() => {}}>
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <i className="fas fa-chevron-right text-sm text-gray-500"></i>
                            </div>
                        </SettingsRow>
                        <SettingsRow label={t('sidebarEnableFingerprint')} onClick={() => {}}>
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                <i className="fas fa-chevron-right text-sm text-gray-500"></i>
                            </div>
                        </SettingsRow>
                    </>
                )}
            </SettingsSection>
        </div>
    );
};

// ==================================================================
// About Content
// ==================================================================

interface AboutContentProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
}

const AboutContent: React.FC<AboutContentProps> = ({ userProfile, setUserProfile }) => {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);
    const appVersion = '1.1.0';
    const [feedback, setFeedback] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    const handleShare = () => {
        navigator.clipboard.writeText('https://example.com/app');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedbackSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (feedback.trim()) {
            setFeedbackSubmitted(true);
            setTimeout(() => {
                setFeedbackSubmitted(false);
                setFeedback('');
            }, 3000);
        }
    };

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(userProfile.name);
    const [email, setEmail] = useState(userProfile.email);
    const [avatar, setAvatar] = useState(userProfile.avatar || '');

    const handleProfileSave = (e: React.FormEvent) => {
        e.preventDefault();
        setUserProfile({
            ...userProfile,
            name,
            email,
            avatar,
        });
        setIsEditing(false);
    };

    const handleEditClick = () => {
        setName(userProfile.name);
        setEmail(userProfile.email);
        setAvatar(userProfile.avatar || '');
        setIsEditing(true);
    };

    const inputClasses = "w-full p-3 border-none rounded-xl bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500/50 transition-all font-medium text-sm";
    
    return (
        <div className="pb-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{t('profile') || 'Profile & About'}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your personal information and app details.</p>
            </div>

            <SettingsSection title={t('profile')} icon="fas fa-user-circle">
                <div className="p-5 sm:p-6">
                    {isEditing ? (
                        <form onSubmit={handleProfileSave} className="space-y-4 animate-fadeIn">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('sidebarProfileName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('sidebarProfileEmail')}</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className={inputClasses} required />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{t('avatarUrl')}</label>
                                <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} className={inputClasses} placeholder="https://example.com/image.png"/>
                            </div>
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-5 py-2.5 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{t('cancel')}</button>
                                <button type="submit" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-cyan-500 shadow-md shadow-cyan-500/20 hover:shadow-lg transition-all">{t('saveProfile')}</button>
                            </div>
                        </form>
                    ) : (
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                            <img src={userProfile.avatar || `https://ui-avatars.com/api/?name=${userProfile.name.replace(/\s/g, '+')}&background=random&color=fff`} alt="User Avatar" className="w-20 h-20 rounded-full object-cover shadow-sm ring-4 ring-white dark:ring-gray-800" />
                            <div className="flex-1 text-center sm:text-left">
                                <p className="text-xl font-bold text-gray-900 dark:text-white">{userProfile.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{userProfile.email}</p>
                                <button onClick={handleEditClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-purple-600 dark:text-cyan-400 bg-purple-50 dark:bg-cyan-900/20 hover:bg-purple-100 dark:hover:bg-cyan-900/40 transition-colors">
                                   <i className="fas fa-pencil-alt text-xs"></i> {t('sidebarEditProfile')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </SettingsSection>

            <SettingsSection title={t('sidebarGetInTouch')} icon="fas fa-headset">
                <SettingsRow label="Email Support" subLabel="mon14yee@gmail.com" onClick={() => window.location.href='mailto:mon14yee@gmail.com'}>
                    <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <i className="fas fa-envelope"></i>
                    </div>
                </SettingsRow>
                <SettingsRow label="Instagram" subLabel="@menkirwolde" onClick={() => window.open('https://www.instagram.com/menkirwolde?igsh=MTY4Nmh1N2FtMHVrNg==', '_blank')}>
                    <div className="w-10 h-10 rounded-full bg-pink-50 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                        <i className="fab fa-instagram"></i>
                    </div>
                </SettingsRow>
            </SettingsSection>

            <SettingsSection title={t('feedback')} icon="fas fa-comment-dots">
                <div className="p-5 sm:p-6">
                    <p className="text-sm mb-5 text-gray-600 dark:text-gray-400">{t('sidebarFeedbackDescription')}</p>
                    {feedbackSubmitted ? (
                        <div className="flex items-center justify-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl">
                            <i className="fas fa-check-circle"></i>
                            <span className="font-semibold text-sm">{t('feedbackSent')}</span>
                        </div>
                    ) : (
                        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                            <textarea
                                value={feedback}
                                onChange={e => setFeedback(e.target.value)}
                                placeholder={t('feedbackPlaceholder')}
                                className={inputClasses}
                                rows={3}
                                required
                            />
                            <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-cyan-500/20 hover:shadow-lg transition-all flex items-center justify-center gap-2">
                                <i className="fas fa-paper-plane text-sm"></i> {t('submit')}
                            </button>
                        </form>
                    )}
                </div>
            </SettingsSection>

            <SettingsSection title={t('sidebarAbout')} icon="fas fa-info-circle">
                <SettingsRow label={t('sidebarVersion')} subLabel="Current build">
                    <span className="font-mono bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg text-xs font-semibold">{appVersion}</span>
                </SettingsRow>
                <div className="p-5 sm:p-6 pt-0 border-t-0">
                    <button className="w-full text-sm font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <i className="fas fa-cloud-download-alt"></i> {t('sidebarCheckForUpdates')}
                    </button>
                </div>
            </SettingsSection>
        </div>
    );
};

// ==================================================================
// Main combined component
// ==================================================================

interface SettingsAndAboutViewProps {
    userProfile: UserProfile;
    setUserProfile: (profile: UserProfile) => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsAndAboutView: React.FC<SettingsAndAboutViewProps> = ({ userProfile, setUserProfile, theme, setTheme }) => {
    return (
        <div className="bg-transparent h-full pb-16">
            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div>
                    <SettingsContent theme={theme} setTheme={setTheme} />
                </div>
                <div>
                    <AboutContent userProfile={userProfile} setUserProfile={setUserProfile} />
                </div>
            </div>
        </div>
    );
};

export default SettingsAndAboutView;
