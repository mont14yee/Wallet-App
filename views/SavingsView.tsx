import { addMoney, subtractMoney, multiplyMoney, divideMoney } from '../utils/money';
import React, { useState, useMemo, useCallback } from 'react';
import { SavingsGoal, ExtraContribution, CompoundingFrequency } from '../types';
import { formatCurrency, parseLocalDate } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';

interface SavingsViewProps {
    items: SavingsGoal[];
    addSavingsGoal: (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => void;
    deleteSavingsGoal: (id: number) => void;
    addExtraContribution: (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => void;
    netBalance: number;
    theme: 'light' | 'dark';
}

const compoundBalance = (goal: SavingsGoal, fromDate: Date, toDate: Date) => {
    const { startingBalance, monthlyContribution, interestRate, compoundingFrequency, extraContributions } = goal;
    const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12 + (toDate.getMonth() - fromDate.getMonth());
    
    if (months < 0) return { projection: [], futureValue: startingBalance };

    const n = { [CompoundingFrequency.Daily]: 365, [CompoundingFrequency.Monthly]: 12, [CompoundingFrequency.Yearly]: 1 }[compoundingFrequency];
    const r = interestRate / 100;
    
    const projectionData: { date: Date, balance: number }[] = [];
    let balance = startingBalance;
    let currentDate = new Date(fromDate.getFullYear(), fromDate.getMonth(), 1);

    for (let i = 0; i <= months; i++) {
        projectionData.push({ date: new Date(currentDate), balance: balance });

        const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
        
        // Apply interest
        if (interestRate > 0) {
            if (compoundingFrequency === CompoundingFrequency.Monthly) {
                balance = multiplyMoney(balance, 1 + r / n);
            } else if (compoundingFrequency === CompoundingFrequency.Daily) {
                balance = multiplyMoney(balance, Math.pow(1 + r / n, daysInMonth));
            } else if (compoundingFrequency === CompoundingFrequency.Yearly && currentDate.getMonth() === 11) {
                balance = multiplyMoney(balance, 1 + r / n);
            }
        }

        // Add monthly contribution
        balance = addMoney(balance, monthlyContribution);

        // Add any extra contributions for this month
        const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        extraContributions.forEach(c => {
            if (c.date.startsWith(monthKey)) {
                balance = addMoney(balance, c.amount);
            }
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return { projection: projectionData, futureValue: balance };
};

const calculateProjection = (goal: SavingsGoal) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const endDate = parseLocalDate(goal.deadline);
    
    if (endDate <= today) return { projection: [], currentValue: goal.startingBalance, futureValue: goal.startingBalance };

    const { projection, futureValue } = compoundBalance(goal, today, endDate);
    
    const monthFormatter = new Intl.DateTimeFormat('default', { month: 'short', year: '2-digit' });
    const formattedProjection = projection.map(p => ({
        date: monthFormatter.format(p.date),
        balance: p.balance
    }));

    return { projection: formattedProjection, currentValue: goal.startingBalance, futureValue };
};

const GrowthChart: React.FC<{ goal: SavingsGoal; projection: any[], theme: 'light' | 'dark' }> = ({ goal, projection, theme }) => {
    const { t } = useLanguage();
    const milestones = useMemo(() => {
        return [0.25, 0.50, 0.75, 1.0].map(p => {
            const target = goal.targetAmount * p;
            const point = projection.find(d => d.balance >= target);
            if (point) return { ...point, label: `${p*100}%` };
            return null;
        }).filter(Boolean);
    }, [goal.targetAmount, projection]);

    return (
        <div style={{ width: '100%', height: 200 }}>
            <ResponsiveContainer>
                <LineChart data={projection} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#4a5568' : '#e2e8f0'} />
                    <XAxis dataKey="date" tick={{ fill: theme === 'dark' ? '#a0aec0' : '#4a5568' }} fontSize={10} />
                    <YAxis tick={{ fill: theme === 'dark' ? '#a0aec0' : '#4a5568' }} fontSize={10} domain={['dataMin', goal.targetAmount * 1.1]}/>
                    <Tooltip />
                    <Line type="monotone" dataKey="balance" name={t('balance')} stroke="#22c55e" strokeWidth={2} dot={false} />
                    {milestones.map((m, i) => m && <ReferenceDot key={i} x={m.date} y={m.balance} r={5} fill="#fbbf24" stroke="white" />)}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};


const SavingsGoalCard: React.FC<{ item: SavingsGoal; onDelete: (id: number) => void; onAddExtra: (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => void; theme: 'light' | 'dark' }> = ({ item, onDelete, onAddExtra, theme }) => {
    const { t, currencySettings } = useLanguage();
    const [boosterAmount, setBoosterAmount] = useState('');
    const { projection, futureValue } = useMemo(() => calculateProjection(item), [item]);
    
    const currentValue = useMemo(() => {
         const startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
         const today = new Date();
         const { projection } = compoundBalance(item, startDate, today);
         return projection.length > 0 ? projection[projection.length - 1].balance : item.startingBalance;
    }, [item]);


    const progress = item.targetAmount > 0 ? Math.min(100, (currentValue / item.targetAmount) * 100) : 0;

    const handleAddBooster = (e: React.FormEvent) => {
        e.preventDefault();
        const amount = parseFloat(boosterAmount);
        if (amount > 0) {
            onAddExtra(item.id, { amount, date: new Date().toISOString().split('T')[0] });
            setBoosterAmount('');
        }
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">{item.name}</h3>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1">{t('deadline')}: {item.deadline}</p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-wide">{item.interestRate}% APY, {t(item.compoundingFrequency)}</p>
                </div>
                <button onClick={() => onDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                    <i className="fas fa-trash text-sm"></i>
                </button>
            </div>

            <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('progress')}</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">{progress.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className="flex justify-between text-sm mt-1 text-gray-600 dark:text-gray-400">
                    <span>{formatCurrency(currentValue, currencySettings)}</span>
                    <span>{formatCurrency(item.targetAmount, currencySettings)}</span>
                </div>
            </div>

            <div className="mt-4">
                 <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">{t('projectedGrowth')}</h4>
                 <GrowthChart goal={item} projection={projection} theme={theme} />
                 <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-2">{t('futureValue')}: <span className="font-semibold text-gray-700 dark:text-gray-200">{formatCurrency(futureValue, currencySettings)}</span></p>
            </div>
            
             <form onSubmit={handleAddBooster} className="mt-5 p-3 bg-gray-50/80 dark:bg-gray-700/30 rounded-3xl border border-gray-100 dark:border-gray-600/30 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-yellow-500 flex-shrink-0">
                    <i className="fas fa-rocket text-sm"></i>
                </div>
                <input type="number" value={boosterAmount} onChange={e => setBoosterAmount(e.target.value)} placeholder={t('addBooster')} className="flex-grow bg-transparent text-sm font-medium focus:outline-none placeholder-gray-400" />
                <button type="submit" className="text-sm font-bold text-teal-600 dark:text-cyan-400 hover:bg-teal-50 dark:hover:bg-cyan-900/20 px-3 py-1.5 rounded-full transition-colors">{t('add')}</button>
            </form>
        </div>
    );
};

const SavingsView: React.FC<SavingsViewProps> = ({ items, addSavingsGoal, deleteSavingsGoal, addExtraContribution, netBalance, theme }) => {
    const { t, currencySettings } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [deadline, setDeadline] = useState(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
    const [startingBalance, setStartingBalance] = useState('0');
    const [monthlyContribution, setMonthlyContribution] = useState('');
    const [interestRate, setInterestRate] = useState('4.5');
    const [compoundingFrequency, setCompoundingFrequency] = useState<CompoundingFrequency>(CompoundingFrequency.Monthly);

    const resetForm = () => {
        setName(''); setTargetAmount(''); setStartingBalance('0'); setMonthlyContribution('');
        setDeadline(new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0]);
        setInterestRate('4.5'); setCompoundingFrequency(CompoundingFrequency.Monthly);
        setShowForm(false);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        addSavingsGoal({
            name,
            targetAmount: parseFloat(targetAmount),
            deadline,
            startingBalance: parseFloat(startingBalance),
            monthlyContribution: parseFloat(monthlyContribution),
            interestRate: parseFloat(interestRate),
            compoundingFrequency,
        });
        resetForm();
    };
    
    const inputClasses = "w-full p-2 border rounded bg-transparent border-gray-300 dark:border-gray-600 dark:text-white dark:placeholder-gray-400";

    return (
        <div className="p-6 sm:p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 mb-8 animate-fadeIn">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100 dark:border-gray-700/50">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-gray-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <i className="fas fa-piggy-bank"></i>
                    </div>
                    {t('savings')}
                </h2>
                <button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold py-2 px-4 rounded-full hover:shadow-lg transition-all text-sm flex items-center gap-2">
                    <i className="fas fa-plus"></i> {t('newSavingsGoal')}
                </button>
            </div>

            {showForm && (
                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400 mb-4">{t('newSavingsGoal')}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t('goalNamePlaceholder')} className={inputClasses} required />
                            <input type="number" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} placeholder={`${t('targetAmount')} (${currencySettings.symbol})`} className={inputClasses} required />
                            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputClasses} required />
                            <input type="number" value={startingBalance} onChange={e => setStartingBalance(e.target.value)} placeholder={`${t('startingBalance')} (${currencySettings.symbol})`} className={inputClasses} required />
                            <div>
                                <input type="number" value={monthlyContribution} onChange={e => setMonthlyContribution(e.target.value)} placeholder={`${t('monthlyContribution')} (${currencySettings.symbol})`} className={inputClasses} required />
                                {netBalance > 0 && <p className="text-xs text-gray-500 mt-1">{t('suggestedContribution')}: {formatCurrency(netBalance, currencySettings)}</p>}
                            </div>
                            <input type="number" step="0.01" value={interestRate} onChange={e => setInterestRate(e.target.value)} placeholder={`${t('interestRate')}`} className={inputClasses} required />
                            <select value={compoundingFrequency} onChange={e => setCompoundingFrequency(e.target.value as CompoundingFrequency)} className={inputClasses}>
                                <option value={CompoundingFrequency.Daily}>{t('daily')}</option>
                                <option value={CompoundingFrequency.Monthly}>{t('monthly')}</option>
                                <option value={CompoundingFrequency.Yearly}>{t('yearly')}</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 mt-4">
                            <button type="button" onClick={resetForm} className="bg-gray-300 dark:bg-gray-600 font-bold py-2 px-4 rounded-full">{t('cancel')}</button>
                            <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full">{t('save')}</button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="space-y-4">
                {items.length > 0 ? (
                    items.map(item => <SavingsGoalCard key={item.id} item={item} onDelete={deleteSavingsGoal} onAddExtra={addExtraContribution} theme={theme} />)
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">{t('noSavingsGoals')}</p>
                )}
            </div>
        </div>
    );
};

export default SavingsView;