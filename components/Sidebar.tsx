import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SettingsSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
    <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-4 px-2 flex items-center gap-3">
            <i className={`${icon} fa-fw text-lg`}></i> {title}
        </h3>
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
            {children}
        </div>
    </div>
);

const SettingsRow: React.FC<{ label: string; subLabel?: string; children: React.ReactNode; onClick?: () => void }> = ({ label, subLabel, children, onClick }) => (
    <div onClick={onClick} className={`flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 gap-4 ${onClick ? 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors' : ''}`}>
        <div>
            <span className="font-semibold text-gray-800 dark:text-gray-100">{label}</span>
            {subLabel && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subLabel}</p>}
        </div>
        <div className="flex-shrink-0">
            {children}
        </div>
    </div>
);

interface SettingsViewProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ theme, setTheme }) => {
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
        <div className="p-4 sm:p-6 lg:p-8 bg-transparent min-h-full">
            <div className="max-w-3xl mx-auto pb-24">
                <div className="mb-10 text-center sm:text-left">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('settings') || 'Settings'}</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Manage your app preferences and configurations.</p>
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
                                <i className="fas fa-chevron-right text-gray-400"></i>
                            </SettingsRow>
                            <SettingsRow label={t('sidebarEnableFingerprint')} onClick={() => {}}>
                                <i className="fas fa-chevron-right text-gray-400"></i>
                            </SettingsRow>
                        </>
                    )}
                </SettingsSection>
            </div>
        </div>
    );
};

export default SettingsView;