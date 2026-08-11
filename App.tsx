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

import { auth, db } from './firebaseConfig';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './firebaseError';






const App: React.FC = () => {
    const { language, t, currencySettings } = useLanguage();
    const [activeView, setActiveView] = useState<ViewType>(ViewType.Dashboard);
    const [activeFeature, setActiveFeature] = useState<FeatureType | null>(null);
    const [featureOrigin, setFeatureOrigin] = useState<{x: number, y: number} | null>(null);
    
    
    const [userProfile, setUserProfileState] = useState<UserProfile | null>(null);
    const [authReady, setAuthReady] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    const [income, setIncome] = useState<Transaction[]>([]);
    const [expenses, setExpenses] = useState<Transaction[]>([]);
    const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [scheduledTransactions, setScheduledTransactions] = useState<ScheduledTransaction[]>([]);
    const [investments, setInvestments] = useState<Investment[]>([]);


    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'dark' || savedTheme === 'light') ? savedTheme : 'light';
    });
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [isChatbotOpen, setChatbotOpen] = useState(false);


    useEffect(() => {
        let snapshotUnsubscribes: (() => void)[] = [];

        const cleanupSnapshots = () => {
            snapshotUnsubscribes.forEach(unsub => unsub());
            snapshotUnsubscribes = [];
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            cleanupSnapshots();

            if (user) {
                setUserProfileState({
                    name: user.displayName || 'User',
                    email: user.email || '',
                    avatar: user.photoURL || undefined
                });
                
                // Fetch data
                const cols = [
                    { path: 'income', setter: setIncome },
                    { path: 'expenses', setter: setExpenses },
                    { path: 'savingsGoals', setter: setSavingsGoals },
                    { path: 'loans', setter: setLoans },
                    { path: 'subscriptions', setter: setSubscriptions },
                    { path: 'scheduledTransactions', setter: setScheduledTransactions },
                    { path: 'investments', setter: setInvestments }
                ];
                
                snapshotUnsubscribes = cols.map(({path, setter}) => {
                    return onSnapshot(collection(db, 'users', user.uid, path), (snapshot) => {
                        const items: any[] = [];
                        snapshot.forEach((doc) => items.push({ ...doc.data(), id: Number(doc.id) }));
                        setter(items as any);
                    }, (error) => {
                        handleFirestoreError(error, OperationType.GET, `users/${user.uid}/${path}`);
                    });
                });
                
                setAuthReady(true);
            } else {
                setUserProfileState(null);
                setIncome([]);
                setExpenses([]);
                setSavingsGoals([]);
                setLoans([]);
                setSubscriptions([]);
                setScheduledTransactions([]);
                setInvestments([]);
                setAuthReady(true);
            }
        });
        
        return () => {
            cleanupSnapshots();
            unsubscribe();
        };
    }, []);

    const login = async () => {
        const provider = new GoogleAuthProvider();
        setLoginError(null);
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Login failed", error);
            if (error.code === 'auth/popup-closed-by-user') {
                setLoginError("Sign-in popup was closed before completing. Please try again.");
            } else if (error.code === 'auth/cancelled-popup-request') {
                setLoginError("Multiple popup requests were cancelled. Please try again.");
            } else if (error.code === 'auth/popup-blocked') {
                setLoginError("Sign-in popup was blocked by your browser. Please allow popups for this site.");
            } else {
                setLoginError("Login failed: " + (error.message || "Unknown error"));
            }
        }
    };

    const logout = async () => {
        await signOut(auth);
    };

    const setUserProfile = (profile: UserProfile) => {
        // Mock to avoid breaking props passed down
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

    const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const colName = type === TransactionType.Income ? 'income' : 'expenses';
            await setDoc(doc(db, 'users', auth.currentUser.uid, colName, newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users'); }
    }, []);

    const deleteTransaction = useCallback(async (type: TransactionType, id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const colName = type === TransactionType.Income ? 'income' : 'expenses';
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, colName, id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users'); }
    }, []);

    const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        const newItem = { ...item, id: generateId(), extraContributions: [] };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'savingsGoals', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/savingsGoals'); }
    }, []);

    const deleteSavingsGoal = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'savingsGoals', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/savingsGoals'); }
    }, []);
    
    const addExtraContribution = useCallback(async (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const goal = savingsGoals.find(g => g.id === goalId);
            if (!goal) return;
            const updated = {
                ...goal,
                extraContributions: [{ ...contribution, id: generateId() }, ...(goal.extraContributions || [])]
            };
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'savingsGoals', goalId.toString()), updated);
        } catch(e) { handleFirestoreError(e, OperationType.UPDATE, 'users/savingsGoals'); }
    }, [savingsGoals]);

    const addIncomeCategory = useCallback((category: string) => {
        if (!incomeCategories.includes(category)) {
            setIncomeCategories(prev => [...prev, category]);
        }
    }, [incomeCategories]);

    const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'loans', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/loans'); }
    }, []);

    const deleteLoan = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'loans', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/loans'); }
    }, []);

    const addRepaymentToLoan = useCallback(async (loanId: number, repayment: Omit<Repayment, 'id'>) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return;
            const newRepayment = { ...repayment, id: generateId() };
            const updated = {
                ...loan,
                outstandingAmount: Math.max(0, subtractMoney(loan.outstandingAmount, repayment.amount)),
                repayments: [newRepayment, ...(loan.repayments || [])]
            };
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'loans', loanId.toString()), updated);
            
            if (loan.type === LoanType.Lent) {
                addTransaction(TransactionType.Income, {
                    name: `${t('repaymentFrom')} ${loan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Repayment',
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: `${t('paymentTo')} ${loan.person}`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Loan Payment',
                });
            }
        } catch(e) { handleFirestoreError(e, OperationType.UPDATE, 'users/loans'); }
    }, [loans, addTransaction, t]);

    const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'subscriptions', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/subscriptions'); }
    }, []);

    const updateSubscription = useCallback(async (updatedItem: Subscription) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'subscriptions', updatedItem.id.toString()), updatedItem);
        } catch(e) { handleFirestoreError(e, OperationType.UPDATE, 'users/subscriptions'); }
    }, []);

    const deleteSubscription = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'subscriptions', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/subscriptions'); }
    }, []);

    const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'scheduledTransactions', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/scheduledTransactions'); }
    }, []);

    const updateScheduledTransaction = useCallback((updatedItem: ScheduledTransaction) => {
        setScheduledTransactions(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    }, []);

    const deleteScheduledTransaction = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'scheduledTransactions', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/scheduledTransactions'); }
    }, []);
    
    const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'investments', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/investments'); }
    }, []);

    const updateInvestment = useCallback(async (updatedItem: Investment) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'investments', updatedItem.id.toString()), updatedItem);
        } catch(e) { handleFirestoreError(e, OperationType.UPDATE, 'users/investments'); }
    }, []);

    const sellInvestment = useCallback(async (id: number) => {
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
            try {
                if (!auth.currentUser) throw new Error("Not logged in");
                await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'investments', id.toString()));
            } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/investments'); }
        }
    }, [investments, addTransaction, t]);

    const deleteInvestment = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'investments', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/investments'); }
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
                        income={income}
                        expenses={expenses}
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

    if (!authReady) {
        return <div className="min-h-screen flex items-center justify-center font-light text-gray-500">Loading...</div>;
    }

    if (!userProfile) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 ${theme === 'dark' ? 'bg-[#0b0f19] text-gray-100' : 'bg-[#fcfdfd] text-gray-900'}`}>
                <div className="w-full max-w-sm text-center">
                    <h1 className="text-3xl font-light mb-4">Welcome to Waalet</h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8 font-light">Please sign in to access your personal finance dashboard.</p>
                    {loginError && (
                        <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-6 text-sm text-left">
                            {loginError}
                        </div>
                    )}
                    <button 
                        onClick={login}
                        className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 px-6 rounded-2xl shadow-lg transition-transform transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.761H12.545z"/></svg>
                        <span>Sign in with Google</span>
                    </button>
                </div>
            </div>
        );
    }

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