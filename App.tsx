import { addMoney, subtractMoney, multiplyMoney, divideMoney } from './utils/money';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ViewType, Transaction, SavingsGoal, TransactionType, AllTransaction, UserProfile, FeatureType, Loan, LoanType, Repayment, ExtraContribution, Subscription, ScheduledTransaction, Investment } from './types';
import { generateId, INITIAL_INCOME, INITIAL_EXPENSES, INITIAL_SAVINGS_GOALS, getIncomeCategories, getAllExpenseCategories, getShoppingCategories, INITIAL_LOANS, INITIAL_SUBSCRIPTIONS, INITIAL_SCHEDULED_TRANSACTIONS, INITIAL_INVESTMENTS } from './constants';
import Header from './components/Header';
import FooterNav from './components/FooterNav';
import DashboardView from './views/DashboardView';
import IncomeView from './views/IncomeView';
import ExpensesView from './views/ExpensesView';
import SavingsView from './views/SavingsView';
import MoreView from './views/MoreView';
import Chatbot from './components/Chatbot';
import { useLanguage } from './contexts/LanguageContext';
import ReportsView from './views/ReportsView';
import CalculatorView from './views/CalculatorView';
import CurrencyConverter from './views/CurrencyConverterView';
import NutritionView from './components/NutritionView';
import SettingsAndAboutView from './components/charts/SettingsAndAboutView';
import LoansView from './views/LoansView';
import SubscriptionsView from './views/SubscriptionsView';
import ActivityLogView from './views/ActivityLogView';
import ScheduledView from './views/ScheduledView';
import CalendarView from './views/CalendarView';
import InvestmentsView from './views/InvestmentsView';


const loadUserDataFor = (email: string) => {
    const load = <T,>(key: string, fallback: T): T => {
        if (!email) return fallback;
        try {
            const saved = localStorage.getItem(`${key}-${email}`);
            return saved ? JSON.parse(saved) : fallback;
        } catch (error) {
            console.error(`Failed to load ${key} from localStorage for ${email}`, error);
            return fallback;
        }
    };
    return {
        income: load<Transaction[]>('wallet-income', INITIAL_INCOME),
        expenses: load<Transaction[]>('wallet-expenses', INITIAL_EXPENSES),
        savingsGoals: load<SavingsGoal[]>('wallet-savings', INITIAL_SAVINGS_GOALS),
        loans: load<Loan[]>('wallet-loans', INITIAL_LOANS),
        subscriptions: load<Subscription[]>('wallet-subscriptions', INITIAL_SUBSCRIPTIONS),
        scheduled: load<ScheduledTransaction[]>('wallet-scheduled', INITIAL_SCHEDULED_TRANSACTIONS),
        investments: load<Investment[]>('wallet-investments', INITIAL_INVESTMENTS),
    };
};


const App: React.FC = () => {
    const { language, t, currencySettings } = useLanguage();
    const [activeView, setActiveView] = useState<ViewType>(ViewType.Dashboard);
    const [activeFeature, setActiveFeature] = useState<FeatureType | null>(null);
    const [featureOrigin, setFeatureOrigin] = useState<{x: number, y: number} | null>(null);
    
    const [userProfile, setUserProfileState] = useState<UserProfile>(() => {
        try {
            const savedProfile = localStorage.getItem('wallet-user-profile');
            return savedProfile ? JSON.parse(savedProfile) : { name: 'Guest User', email: 'guest@example.com', avatar: undefined };
        } catch (error) {
            console.error("Failed to load user profile from localStorage", error);
            return { name: 'Guest User', email: 'guest@example.com', avatar: undefined };
        }
    });

    const [income, setIncome] = useState<Transaction[]>(() => loadUserDataFor(userProfile.email).income);
    const [expenses, setExpenses] = useState<Transaction[]>(() => loadUserDataFor(userProfile.email).expenses);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => loadUserDataFor(userProfile.email).savingsGoals);
    const [loans, setLoans] = useState<Loan[]>(() => loadUserDataFor(userProfile.email).loans);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => loadUserDataFor(userProfile.email).subscriptions);
    const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>(() => loadUserDataFor(userProfile.email).scheduled);
    const [investments, setInvestments] = useState<Investment[]>(() => loadUserDataFor(userProfile.email).investments);


    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    });
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [isChatbotOpen, setChatbotOpen] = useState(false);

    const setUserProfile = (profile: UserProfile) => {
        const oldEmail = userProfile.email;
        try {
            localStorage.setItem('wallet-user-profile', JSON.stringify(profile));
        } catch (error) {
            console.error("Failed to save user profile to localStorage", error);
        }
        
        setUserProfileState(profile);

        if (profile.email !== oldEmail) {
            // If the user is logging in from a guest session, merge the data.
            if (oldEmail === 'guest@example.com' && profile.email !== 'guest@example.com') {
                const guestData = loadUserDataFor(oldEmail);
                const userData = loadUserDataFor(profile.email);

                const mergeAndDeduplicate = <T extends { id: number }>(userArr: T[], guestArr: T[]): T[] => {
                    const combined = [...userArr, ...guestArr];
                    const map = new Map(combined.map(item => [item.id, item]));
                    return Array.from(map.values());
                };

                setIncome(mergeAndDeduplicate(userData.income, guestData.income));
                setExpenses(mergeAndDeduplicate(userData.expenses, guestData.expenses));
                setSavingsGoals(mergeAndDeduplicate(userData.savingsGoals, guestData.savingsGoals));
                setLoans(mergeAndDeduplicate(userData.loans, guestData.loans));
                setSubscriptions(mergeAndDeduplicate(userData.subscriptions, guestData.subscriptions));
                setScheduledTransactions(mergeAndDeduplicate(userData.scheduled, guestData.scheduled));
                setInvestments(mergeAndDeduplicate(userData.investments, guestData.investments));

                // Clean up guest data after merging
                const keysToClear = ['income', 'expenses', 'savings', 'loans', 'subscriptions', 'scheduled', 'investments'];
                keysToClear.forEach(key => {
                    localStorage.removeItem(`wallet-${key}-${oldEmail}`);
                });

            } else {
                // Otherwise, just load the new user's data (handles logout to guest or user switching)
                const { income, expenses, savingsGoals, loans, subscriptions, scheduled, investments } = loadUserDataFor(profile.email);
                setIncome(income);
                setExpenses(expenses);
                setSavingsGoals(savingsGoals);
                setLoans(loans);
                setSubscriptions(subscriptions);
                setScheduledTransactions(scheduled);
                setInvestments(investments);
            }
        }
    };

    const [incomeCategories, setIncomeCategories] = useState<string[]>(getIncomeCategories(language));
    const [allExpenseCategories, setAllExpenseCategories] = useState<string[]>(getAllExpenseCategories(language));
    const [shoppingCategories, setShoppingCategories] = useState<string[]>(getShoppingCategories(language));

    useEffect(() => {
        setIncomeCategories(getIncomeCategories(language));
        setAllExpenseCategories(getAllExpenseCategories(language));
        setShoppingCategories(getShoppingCategories(language));
    }, [language]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-income-${userProfile.email}`, JSON.stringify(income));
        } catch (error) {
            console.error("Failed to save income to localStorage", error);
        }
    }, [income, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-expenses-${userProfile.email}`, JSON.stringify(expenses));
        } catch (error) {
            console.error("Failed to save expenses to localStorage", error);
        }
    }, [expenses, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-savings-${userProfile.email}`, JSON.stringify(savingsGoals));
        } catch (error) {
            console.error("Failed to save savings to localStorage", error);
        }
    }, [savingsGoals, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-loans-${userProfile.email}`, JSON.stringify(loans));
        } catch (error) {
            console.error("Failed to save loans to localStorage", error);
        }
    }, [loans, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-subscriptions-${userProfile.email}`, JSON.stringify(subscriptions));
        } catch (error) {
            console.error("Failed to save subscriptions to localStorage", error);
        }
    }, [subscriptions, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-scheduled-${userProfile.email}`, JSON.stringify(scheduledTransactions));
        } catch (error) {
            console.error("Failed to save scheduled transactions to localStorage", error);
        }
    }, [scheduledTransactions, userProfile.email]);

    useEffect(() => {
        if (!userProfile.email) return;
        try {
            localStorage.setItem(`wallet-investments-${userProfile.email}`, JSON.stringify(investments));
        } catch (error) {
            console.error("Failed to save investments to localStorage", error);
        }
    }, [investments, userProfile.email]);


    useEffect(() => {
        // Clear category filter when navigating away from transaction lists
        if (activeView !== ViewType.Expenses && activeView !== ViewType.Income) {
            setCategoryFilter(null);
        }
    }, [activeView]);


    const allTransactions: AllTransaction[] = useMemo(() => {
        const incomeWithType = income.map(t => ({ ...t, type: TransactionType.Income as const }));
        const expensesWithType = expenses.map(t => ({
          ...t,
          type: shoppingCategories.includes(t.category) ? TransactionType.Shopping : TransactionType.Expense,
        }));
        return [...incomeWithType, ...expensesWithType];
    }, [income, expenses, shoppingCategories]);
    
    const shoppingListForTargets = useMemo(() => 
        expenses.filter(t => shoppingCategories.includes(t.category))
    , [expenses, shoppingCategories]);

    const totalIncome = useMemo(() => income.reduce((sum, item) => addMoney(sum, item.amount), 0), [income]);
    const totalExpenses = useMemo(() => expenses.reduce((sum, item) => addMoney(sum, item.amount), 0), [expenses]);
    const netAmount = useMemo(() => subtractMoney(totalIncome, totalExpenses), [totalIncome, totalExpenses]);

    const totalAssetsLent = useMemo(() => loans.filter(l => l.type === LoanType.Lent).reduce((sum, item) => sum + item.outstandingAmount, 0), [loans]);
    const totalLiabilitiesBorrowed = useMemo(() => loans.filter(l => l.type === LoanType.Borrowed).reduce((sum, item) => sum + item.outstandingAmount, 0), [loans]);


    const allTransactionsForExport = useMemo(() => {
        return [
            ...income.map(tx => ({...tx, type: t('income')})),
            ...expenses.map(tx => ({...tx, type: t('expense')})),
        ].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [income, expenses, t]);
    
    const exportToCSV = () => {
        const data = allTransactionsForExport;
        const filename = 'all_transactions.csv';
        if (!data || data.length === 0) {
            alert(t('noDataToExport'));
            return;
        }

        const sanitizeCsvField = (field: string) => {
            if (/^[=+\-@]/.test(field)) {
                return `'${field}`;
            }
            return field;
        };
    
        const headers = [t('csvType'), t('csvDate'), t('csvName'), t('csvCategory'), `${t('csvAmount')} (${currencySettings.symbol})`];
        const csvRows = [
            headers.map(sanitizeCsvField).join(','), // header row
        ];
    
        for (const item of data) {
            const row = [
                `"${sanitizeCsvField(item.type).replace(/"/g, '""')}"`,
                item.date,
                `"${sanitizeCsvField(item.name).replace(/"/g, '""')}"`,
                `"${sanitizeCsvField(item.category).replace(/"/g, '""')}"`,
                item.amount.toFixed(2)
            ].join(',');
            csvRows.push(row);
        }
    
        const csvString = csvRows.join('\n');
        const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
    
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const addTransaction = useCallback((type: TransactionType, item: Omit<Transaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        if (type === TransactionType.Income) {
            setIncome(prev => [newItem, ...prev]);
        } else if (type === TransactionType.Expense) {
            setExpenses(prev => [newItem, ...prev]);
        }
    }, []);

    const deleteTransaction = useCallback((type: TransactionType, id: number) => {
        if (type === TransactionType.Income) {
            setIncome(prev => prev.filter(item => item.id !== id));
        } else if (type === TransactionType.Expense) {
            setExpenses(prev => prev.filter(item => item.id !== id));
        }
    }, []);

    const addSavingsGoal = useCallback((item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        const newItem = { ...item, id: generateId(), extraContributions: [] };
        setSavingsGoals(prev => [newItem, ...prev]);
    }, []);

    const deleteSavingsGoal = useCallback((id: number) => {
        setSavingsGoals(prev => prev.filter(item => item.id !== id));
    }, []);
    
    const addExtraContribution = useCallback((goalId: number, contribution: Omit<ExtraContribution, 'id'>) => {
        setSavingsGoals(prevGoals => 
            prevGoals.map(goal => {
                if (goal.id === goalId) {
                    return {
                        ...goal,
                        extraContributions: [{ ...contribution, id: generateId() }, ...goal.extraContributions],
                    };
                }
                return goal;
            })
        );
    }, []);

    const addIncomeCategory = useCallback((category: string) => {
        if (!incomeCategories.includes(category)) {
            setIncomeCategories(prev => [...prev, category]);
        }
    }, [incomeCategories]);

    const addLoan = useCallback((item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        setLoans(prev => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, []);

    const deleteLoan = useCallback((id: number) => {
        setLoans(prev => prev.filter(item => item.id !== id));
    }, []);

    const addRepaymentToLoan = useCallback((loanId: number, repayment: Omit<Repayment, 'id'>) => {
        let targetLoan: Loan | undefined;
        setLoans(prevLoans => 
            prevLoans.map(loan => {
                if (loan.id === loanId) {
                    targetLoan = loan;
                    const newRepayment = { ...repayment, id: generateId() };
                    return {
                        ...loan,
                        outstandingAmount: Math.max(0, subtractMoney(loan.outstandingAmount, repayment.amount)),
                        repayments: [newRepayment, ...loan.repayments],
                    };
                }
                return loan;
            })
        );

        if (targetLoan) {
            if (targetLoan.type === LoanType.Lent) {
                addTransaction(TransactionType.Income, {
                    name: `${t('repaymentFrom')} ${targetLoan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Repayment',
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: `${t('paymentTo')} ${targetLoan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Payment',
                });
            }
        }
    }, [addTransaction, t]);

    const addSubscription = useCallback((item: Omit<Subscription, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setSubscriptions(prev => [newItem, ...prev]);
    }, []);

    const updateSubscription = useCallback((updatedItem: Subscription) => {
        setSubscriptions(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const deleteSubscription = useCallback((id: number) => {
        setSubscriptions(prev => prev.filter(item => item.id !== id));
    }, []);

    const addScheduledTransaction = useCallback((item: Omit<ScheduledTransaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setScheduledTransactions(prev => [newItem, ...prev]);
    }, []);

    const updateScheduledTransaction = useCallback((updatedItem: ScheduledTransaction) => {
        setScheduledTransactions(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const deleteScheduledTransaction = useCallback((id: number) => {
        setScheduledTransactions(prev => prev.filter(item => item.id !== id));
    }, []);
    
    const addInvestment = useCallback((item: Omit<Investment, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setInvestments(prev => [newItem, ...prev]);
    }, []);

    const updateInvestment = useCallback((updatedItem: Investment) => {
        setInvestments(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const sellInvestment = useCallback((id: number) => {
        const investmentToSell = investments.find(inv => inv.id === id);
        if (investmentToSell) {
            const gain = multiplyMoney(subtractMoney(investmentToSell.currentPrice, investmentToSell.purchasePrice), investmentToSell.quantity);
            if (gain > 0) {
                addTransaction(TransactionType.Income, {
                    name: `${t('sell')} ${investmentToSell.name}`,
                    amount: gain,
                    date: new Date().toISOString().split('T')[0],
                    category: t('investmentGainsCategory'),
                });
            }
            setInvestments(prev => prev.filter(item => item.id !== id));
        }
    }, [investments, addTransaction, t]);

    const deleteInvestment = useCallback((id: number) => {
        setInvestments(prev => prev.filter(item => item.id !== id));
    }, []);

    const renderView = () => {
        const filteredIncome = categoryFilter ? income.filter(i => i.category === categoryFilter) : income;
        const filteredExpenses = categoryFilter ? expenses.filter(e => e.category === categoryFilter) : expenses;

        switch (activeView) {
            case ViewType.Dashboard:
                return <DashboardView 
                            theme={theme}
                            income={totalIncome} 
                            expenses={totalExpenses} 
                            netAmount={netAmount} 
                            allIncome={income}
                            allExpenses={expenses} 
                            setActiveView={setActiveView}
                            setCategoryFilter={setCategoryFilter}
                            exportToCSV={exportToCSV}
                            assets={totalAssetsLent}
                            liabilities={totalLiabilitiesBorrowed}
                        />;
            case ViewType.Income:
                return <IncomeView 
                            items={filteredIncome} 
                            allItems={income}
                            total={totalIncome} 
                            addIncome={(item) => addTransaction(TransactionType.Income, item)} 
                            deleteIncome={(id) => deleteTransaction(TransactionType.Income, id)}
                            categoryFilter={categoryFilter}
                            onClearFilter={() => setCategoryFilter(null)}
                            categories={incomeCategories}
                            addCategory={addIncomeCategory}
                            theme={theme}
                        />;
            case ViewType.Expenses:
                return <ExpensesView 
                            items={filteredExpenses} 
                            allItems={expenses}
                            total={totalExpenses} 
                            addExpense={(item) => addTransaction(TransactionType.Expense, item)} 
                            deleteExpense={(id) => deleteTransaction(TransactionType.Expense, id)}
                            categoryFilter={categoryFilter}
                            onClearFilter={() => setCategoryFilter(null)}
                            expenseCategories={allExpenseCategories}
                            theme={theme}
                        />;
            case ViewType.More:
                return <MoreView onSelectFeature={(feature, origin) => {
                    setFeatureOrigin(origin || null);
                    setActiveFeature(feature);
                }} />;
            case ViewType.Investments:
                 return <div className="min-h-screen pt-4 pb-24"><InvestmentsView
                        investments={investments}
                        addInvestment={addInvestment}
                        updateInvestment={updateInvestment}
                        sellInvestment={sellInvestment}
                        deleteInvestment={deleteInvestment}
                    /></div>;
            case ViewType.Settings:
                 return <div className="min-h-screen pt-4"><SettingsAndAboutView
                        theme={theme}
                        setTheme={setTheme}
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                    /></div>;
            default:
                return <DashboardView 
                            theme={theme}
                            income={totalIncome} 
                            expenses={totalExpenses} 
                            netAmount={netAmount} 
                            allIncome={income}
                            allExpenses={expenses} 
                            setActiveView={setActiveView}
                            setCategoryFilter={setCategoryFilter}
                            exportToCSV={exportToCSV}
                            assets={totalAssetsLent}
                            liabilities={totalLiabilitiesBorrowed}
                        />;
        }
    };

    const renderFeatureView = () => {
        if (!activeFeature) return null;
    
        const animationStyle: React.CSSProperties = featureOrigin ? {
             '--origin-x': `${featureOrigin.x}px`,
             '--origin-y': `${featureOrigin.y}px`,
             animation: 'clipReveal 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards'
        } as React.CSSProperties : {
             animation: 'fadeIn 0.2s ease-out forwards'
        };

        const FullScreenContainer: React.FC<{title: string; icon: string; children: React.ReactNode;}> = ({ title, icon, children }) => (
            <div className={`fixed inset-0 z-[100] flex flex-col ${theme === 'dark' ? 'bg-[#0b0f19]' : 'bg-[#fcfdfd]'}`} style={animationStyle}>
                {/* Background overlay similar to main app */}
                <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                    {theme === 'light' ? (
                        <>
                            <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#7dd3fc]/30 blur-[100px]" />
                            <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#d8b4fe]/20 blur-[120px]" />
                        </>
                    ) : (
                        <>
                            <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#0284c7]/15 blur-[120px]" />
                        </>
                    )}
                </div>
                
                <header className="flex-shrink-0 pt-12 pb-4 px-6 relative z-10 flex items-center justify-between no-print">
                    <button onClick={() => setActiveFeature(null)} className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors" aria-label={t('cancel')}>
                        <i className="fas fa-chevron-left text-sm"></i>
                    </button>
                    <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        {title}
                    </h2>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <i className="fas fa-sliders-h text-sm"></i>
                    </button>
                </header>
                <main className="flex-1 overflow-y-auto relative z-10 px-2 sm:px-4">
                    {children}
                </main>
            </div>
        );
    
        switch (activeFeature) {
            case FeatureType.ActivityLog:
                return <FullScreenContainer title={t('activityLog')} icon="fas fa-book-open">
                    <ActivityLogView
                        transactions={allTransactions}
                        addTransaction={addTransaction}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                    />
                </FullScreenContainer>;
            case FeatureType.Savings:
                return <FullScreenContainer title={t('savings')} icon="fas fa-piggy-bank">
                    <SavingsView 
                        items={savingsGoals} 
                        addSavingsGoal={addSavingsGoal} 
                        deleteSavingsGoal={deleteSavingsGoal}
                        addExtraContribution={addExtraContribution}
                        netBalance={netAmount}
                        theme={theme}
                    />
                </FullScreenContainer>;
            case FeatureType.Subscriptions:
                return <FullScreenContainer title={t('subscriptions')} icon="fas fa-sync-alt">
                    <SubscriptionsView
                        subscriptions={subscriptions}
                        addSubscription={addSubscription}
                        updateSubscription={updateSubscription}
                        deleteSubscription={deleteSubscription}
                        theme={theme}
                        expenseCategories={allExpenseCategories}
                        incomeCategories={incomeCategories}
                    />
                </FullScreenContainer>;
            case FeatureType.Scheduled:
                 return <FullScreenContainer title={t('scheduledTransactions')} icon="fas fa-calendar-alt">
                    <ScheduledView
                        scheduled={scheduledTransactions}
                        addScheduled={addScheduledTransaction}
                        updateScheduled={updateScheduledTransaction}
                        deleteScheduled={deleteScheduledTransaction}
                        logTransaction={addTransaction}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                    />
                 </FullScreenContainer>;
            case FeatureType.Calendar:
                return <FullScreenContainer title={t('calendar')} icon="fas fa-calendar-day">
                    <CalendarView
                        scheduled={scheduledTransactions}
                        loans={loans}
                        subscriptions={subscriptions}
                    />
                </FullScreenContainer>;
            case FeatureType.Calculator:
                return <FullScreenContainer title={t('calculator')} icon="fas fa-calculator">
                    <div className="p-4 sm:p-6 h-full"><CalculatorView /></div>
                </FullScreenContainer>;
            case FeatureType.Converter:
                 return <FullScreenContainer title={t('converter')} icon="fas fa-exchange-alt">
                    <div className="p-4 sm:p-6 h-full"><CurrencyConverter /></div>
                 </FullScreenContainer>;
            case FeatureType.Reports:
                 return <FullScreenContainer title={t('reports')} icon="fas fa-file-invoice-dollar">
                    <ReportsView
                        userProfile={userProfile}
                        allTransactions={allTransactions}
                        incomeCategories={incomeCategories}
                        expenseCategories={allExpenseCategories}
                        shoppingCategories={shoppingCategories}
                    />
                 </FullScreenContainer>;
            case FeatureType.Loans:
                 return <FullScreenContainer title={t('loans')} icon="fas fa-hand-holding-usd">
                    <LoansView
                        loans={loans}
                        addLoan={addLoan}
                        deleteLoan={deleteLoan}
                        addRepayment={addRepaymentToLoan}
                    />
                 </FullScreenContainer>;
            case FeatureType.Nutrition:
                 return <FullScreenContainer title={t('nutrition')} icon="fas fa-heartbeat">
                    <NutritionView shoppingList={shoppingListForTargets} />
                 </FullScreenContainer>;
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen pb-24 px-0 relative font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b0f19] text-gray-100' : 'bg-[#fcfdfd] text-gray-900'}`}>
            {/* Premium Background Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                {theme === 'light' ? (
                    <>
                        <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#7dd3fc]/40 blur-[100px]" />
                        <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#d8b4fe]/30 blur-[120px]" />
                        <div className="absolute top-[5%] right-[0%] w-[40%] h-[30%] rounded-full bg-[#a5f3fc]/20 blur-[90px]" />
                    </>
                ) : (
                    <>
                        <div className="absolute -bottom-[15%] -left-[20%] w-[80%] h-[50%] rounded-full bg-[#0284c7]/20 blur-[120px]" />
                        <div className="absolute -bottom-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-[#a21caf]/15 blur-[120px]" />
                    </>
                )}
            </div>

            <div className="w-full relative z-10 max-w-xl mx-auto shadow-2xl shadow-gray-200/50 dark:shadow-black/50 min-h-screen bg-white/40 dark:bg-black/20 backdrop-blur-3xl overflow-hidden sm:rounded-3xl sm:my-4 sm:border sm:border-white/20 dark:sm:border-white/5">
                <Header 
                    activeView={activeView} 
                    userProfile={userProfile}
                    setActiveView={setActiveView}
                    onSelectFeature={(feature, origin) => {
                        setFeatureOrigin(origin || null);
                        setActiveFeature(feature);
                    }}
                />
                <main className="px-2">
                    {renderView()}
                </main>
            </div>
            <FooterNav activeView={activeView} setActiveView={setActiveView} />
            <button
                onClick={() => setChatbotOpen(true)}
                className="fixed bottom-24 right-5 sm:bottom-28 sm:right-12 w-14 h-14 bg-gradient-to-tr from-purple-500 to-cyan-400 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 z-40 flex items-center justify-center border border-white/20"
                aria-label={t('financialAssistant')}
            >
                <i className="fas fa-robot fa-lg"></i>
            </button>
            <Chatbot 
                isOpen={isChatbotOpen} 
                onClose={() => setChatbotOpen(false)} 
            />
            {renderFeatureView()}
        </div>
    );
};

export default App;