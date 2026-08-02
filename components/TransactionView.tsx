import { addMoney, subtractMoney, multiplyMoney, divideMoney } from '../utils/money';

import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import ViewContainer from './ViewContainer';
import { formatCurrency } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import MonthlyFlowChart from './charts/MonthlyFlowChart';

interface TransactionViewProps {
    title: string;
    icon: string;
    items: Transaction[];
    allItems: Transaction[];
    total: number;
    onAddItem: (item: Omit<Transaction, 'id'>) => void;
    onDeleteItem: (id: number) => void;
    categories: string[];
    itemIcon: string;
    itemColor: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    totalLabel: string;
    amountColor: string;
    categoryFilter: string | null;
    onClearFilter: () => void;
    onAddCategory?: (category: string) => void;
    theme: 'light' | 'dark';
    chartTitle: string;
    chartDataKey: string;
    chartColor: string;
    pageBg?: string;
    textColor?: string;
    borderColor?: string;
    summaryBgColor?: string;
}

const TransactionItem: React.FC<{ 
    item: Transaction; 
    icon: string; 
    color: string; 
    onDelete: (id: number) => void;
}> = ({ item, icon, color, onDelete }) => {
    const { currencySettings } = useLanguage();
    return (
        <div className="flex justify-between items-center py-4 border-b border-gray-100 dark:border-gray-700/50 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors px-2 rounded-xl">
            <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color.replace('text-', 'bg-').replace('500', '100')} dark:bg-gray-800`}>
                    <i className={`${icon} ${color}`}></i>
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate uppercase tracking-wide">{item.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.category}</p>
                </div>
            </div>
            <div className="flex flex-col items-end gap-1 ml-2">
                <span className={`font-semibold ${color} whitespace-nowrap`}>{formatCurrency(item.amount, currencySettings)}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500">{item.date}</span>
                <button onClick={() => onDelete(item.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors mt-1">
                    <i className="fas fa-trash text-xs"></i>
                </button>
            </div>
        </div>
    );
};


const TransactionForm: React.FC<{
    categories: string[];
    onSave: (item: Omit<Transaction, 'id'>) => void;
    onCancel: () => void;
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    initialData: { name: string; category: string } | null;
    onAddCategory?: (category: string) => void;
}> = ({ categories, onSave, onCancel, title, nameLabel, namePlaceholder, initialData, onAddCategory }) => {
    const { t, currencySettings } = useLanguage();
    const [name, setName] = useState(initialData?.name || '');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(initialData?.category || categories[0] || '');
    
    const inputClasses = "mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-transparent dark:text-white dark:placeholder-gray-400";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && amount && parseFloat(amount) > 0 && date && category) {
            if (onAddCategory && !categories.find(c => c.toLowerCase() === category.toLowerCase())) {
                onAddCategory(category);
            }
            onSave({ name, amount: parseFloat(amount), date, category });
        }
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400 mb-4 flex items-center gap-2"><i className="fas fa-plus-circle"></i> {title}</h3>
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{nameLabel}</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder={namePlaceholder} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount')} ({currencySettings.symbol})</label>
                        <input type="number" min="0.01" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder={t('amountPlaceholder')} className={inputClasses} required />
                        {amount && parseFloat(amount) <= 0 && <p className="text-xs text-red-500 mt-1">Amount must be greater than 0</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('date')}</label>
                        <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClasses} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                        <input 
                            list="category-options"
                            value={category} 
                            onChange={e => setCategory(e.target.value)} 
                            className={inputClasses} 
                            placeholder={t('categoryPlaceholder')}
                            required 
                        />
                        <datalist id="category-options">
                            {categories.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                    <button type="button" onClick={onCancel} className="bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors">{t('cancel')}</button>
                    <button type="submit" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-full hover:bg-slate-700 transition-colors">{t('save')}</button>
                </div>
            </form>
        </div>
    );
};


const TransactionView: React.FC<TransactionViewProps> = (props) => {
    const { title, icon, items, total, onAddItem, onDeleteItem, categories, itemIcon, itemColor, formTitle, nameLabel, namePlaceholder, totalLabel, amountColor, categoryFilter, onClearFilter, onAddCategory, allItems, theme, chartTitle, chartDataKey, chartColor, pageBg, textColor, borderColor, summaryBgColor: customSummaryBgColor } = props;
    const { t, currencySettings, language } = useLanguage();
    const [showForm, setShowForm] = useState(false);
    const [initialFormData, setInitialFormData] = useState<{ name: string; category: string } | null>(null);
    const [isChartVisible, setIsChartVisible] = useState(false);

    const otherCategoryNames = ['Other', 'ሌላ'];

    const comparisonText = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const lastDayOfPreviousMonth = new Date(currentYear, currentMonth, 0);
        const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);

        const currentMonthTotal = allItems
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= currentMonthStart && itemDate <= now;
            })
            .reduce((sum, item) => addMoney(sum, item.amount), 0);

        const previousMonthTotal = allItems
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= firstDayOfPreviousMonth && itemDate <= lastDayOfPreviousMonth;
            })
            .reduce((sum, item) => addMoney(sum, item.amount), 0);

        if (previousMonthTotal === 0) {
            return currentMonthTotal > 0 ? t('comparisonNew') : t('comparisonNoPreviousData');
        }

        const percentageChange = multiplyMoney(divideMoney(subtractMoney(currentMonthTotal, previousMonthTotal), previousMonthTotal), 100);
        
        if (Math.abs(percentageChange) < 0.1) {
            return t('comparisonNoChange');
        }

        if (percentageChange > 0) {
            return t('comparisonIncrease', percentageChange.toFixed(1));
        } else {
            return t('comparisonDecrease', percentageChange.toFixed(1));
        }
    }, [allItems, t]);

    // Display all items, sorted by date descending
    const displayedItems = useMemo(() => {
        return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [items]);

    const monthlyData = useMemo(() => {
        const grouped: { [key: string]: number } = {};
        allItems.forEach(item => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            grouped[monthKey] = addMoney(grouped[monthKey] || 0, item.amount);
        });
        
        const monthFormatter = new Intl.DateTimeFormat(language === 'am' ? 'am-ET' : 'en-US', { month: 'short', year: '2-digit' });

        return Object.entries(grouped)
            .map(([monthKey, total]) => {
                const [year, month] = monthKey.split('-').map(Number);
                const date = new Date(year, month - 1, 1);
                return {
                    date: date,
                    month: monthFormatter.format(date),
                    monthKey: monthKey,
                    [chartDataKey]: total,
                };
            })
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [allItems, chartDataKey, language]);


    const handleSave = (item: Omit<Transaction, 'id'>) => {
        onAddItem(item);
        setShowForm(false);
        setInitialFormData(null);
    };
    
    const handleCancel = () => {
        setShowForm(false);
        setInitialFormData(null);
    };

    const handleQuickAddClick = (category: string) => {
        setInitialFormData({
            name: category,
            category: category,
        });
        setShowForm(true);
    };

    const summaryBgColor = customSummaryBgColor || (amountColor === 'text-slate-600' 
        ? 'from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-800/30' 
        : 'from-red-100 to-red-200 dark:from-red-900/30 dark:to-red-800/30');

    return (
        <ViewContainer
            title={title}
            icon={icon}
            bgColor={pageBg}
            textColor={textColor}
            borderColor={borderColor}
        >
            {categoryFilter && (
                <div className="flex items-center justify-between bg-yellow-100 dark:bg-yellow-900/50 p-3 rounded-lg mb-6 shadow-sm border border-yellow-300 dark:border-yellow-700">
                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                        {t('showingTransactionsFor')}: <span className="font-bold text-base">{categoryFilter}</span>
                    </p>
                    <button
                        onClick={onClearFilter}
                        className="text-sm font-bold bg-yellow-200 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100 px-3 py-1 rounded-full hover:bg-yellow-300 dark:hover:bg-yellow-600 transition-colors"
                    >
                        {t('clearFilter')}
                    </button>
                </div>
            )}
            
            <div className={`p-8 mb-8 rounded-[32px] bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 text-center`}>
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">{totalLabel} ({t('allTime')})</h3>
                <div className={`text-4xl font-semibold tracking-tight my-2 ${amountColor} dark:text-gray-100`}>{formatCurrency(total, currencySettings)}</div>
                <p className="text-xs text-gray-400 dark:text-gray-500">{comparisonText}</p>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-white/60 dark:border-gray-700/50 mb-8">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">Latest Transactions</h3>
                    <button className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-center text-gray-400">
                        <i className="fas fa-ellipsis-h"></i>
                    </button>
                </div>
                <div className="space-y-1">
                    {displayedItems.length > 0 ? displayedItems.map(item => (
                         <TransactionItem 
                            key={item.id} 
                            item={item} 
                            icon={itemIcon} 
                            color={itemColor} 
                            onDelete={onDeleteItem}
                        />
                    )) : (
                         <p className="text-center text-gray-400 dark:text-gray-500 py-6">{t('noItemsFound')}</p>
                    )}
                </div>
                {displayedItems.length > 0 && (
                    <button className="w-full py-3 mt-4 text-sm font-semibold text-teal-600 dark:text-cyan-400 border border-teal-100 dark:border-cyan-900/50 rounded-2xl hover:bg-teal-50 dark:hover:bg-cyan-900/20 transition-colors">
                        See More Insight
                    </button>
                )}
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">{chartTitle}</h3>
                     <button onClick={() => setIsChartVisible(!isChartVisible)} className="text-sm text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-2">
                        {isChartVisible ? 'Hide' : 'Show'} Chart <i className={`fas fa-chevron-down transition-transform ${isChartVisible ? 'rotate-180' : ''}`}></i>
                    </button>
                </div>
                {isChartVisible && (
                     <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md animate-fadeIn">
                        <MonthlyFlowChart
                            theme={theme}
                            data={monthlyData}
                            dataKey={chartDataKey}
                            color={chartColor}
                        />
                    </div>
                )}
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-4">{t('quickAdd')}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {categories.filter(c => !otherCategoryNames.includes(c)).map(cat => (
                        <button key={cat} onClick={() => handleQuickAddClick(cat)} className="text-center p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                            <span className="font-semibold text-sm">{cat}</span>
                        </button>
                    ))}
                    <button onClick={() => setShowForm(true)} className="text-center p-3 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors col-span-2 sm:col-span-1">
                        <span className="font-semibold text-sm text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2"><i className="fas fa-plus"></i> {t('addNew')}</span>
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4 animate-fadeIn" onClick={handleCancel}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <TransactionForm 
                            categories={categories}
                            onSave={handleSave}
                            onCancel={handleCancel}
                            title={formTitle}
                            nameLabel={nameLabel}
                            namePlaceholder={namePlaceholder}
                            initialData={initialFormData}
                            onAddCategory={onAddCategory}
                        />
                    </div>
                </div>
            )}
        </ViewContainer>
    );
};

export default TransactionView;
