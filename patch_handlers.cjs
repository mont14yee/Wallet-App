const fs = require('fs');
let appCode = fs.readFileSync('App.tsx', 'utf8');

const replacements = [
    {
        from: `    const addTransaction = useCallback((type: TransactionType, item: Omit<Transaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        if (type === TransactionType.Income) {
            setIncome(prev => [newItem, ...prev]);
        } else if (type === TransactionType.Expense) {
            setExpenses(prev => [newItem, ...prev]);
        }
    }, []);`,
        to: `    const addTransaction = useCallback(async (type: TransactionType, item: Omit<Transaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const colName = type === TransactionType.Income ? 'income' : 'expenses';
            await setDoc(doc(db, 'users', auth.currentUser.uid, colName, newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users'); }
    }, []);`
    },
    {
        from: `    const deleteTransaction = useCallback((type: TransactionType, id: number) => {
        if (type === TransactionType.Income) {
            setIncome(prev => prev.filter(item => item.id !== id));
        } else if (type === TransactionType.Expense) {
            setExpenses(prev => prev.filter(item => item.id !== id));
        }
    }, []);`,
        to: `    const deleteTransaction = useCallback(async (type: TransactionType, id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const colName = type === TransactionType.Income ? 'income' : 'expenses';
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, colName, id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users'); }
    }, []);`
    },
    {
        from: `    const addSavingsGoal = useCallback((item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        const newItem = { ...item, id: generateId(), extraContributions: [] };
        setSavingsGoals(prev => [newItem, ...prev]);
    }, []);`,
        to: `    const addSavingsGoal = useCallback(async (item: Omit<SavingsGoal, 'id' | 'extraContributions'>) => {
        const newItem = { ...item, id: generateId(), extraContributions: [] };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'savingsGoals', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/savingsGoals'); }
    }, []);`
    },
    {
        from: `    const deleteSavingsGoal = useCallback((id: number) => {
        setSavingsGoals(prev => prev.filter(item => item.id !== id));
    }, []);`,
        to: `    const deleteSavingsGoal = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'savingsGoals', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/savingsGoals'); }
    }, []);`
    },
    {
        from: `    const addExtraContribution = useCallback((goalId: number, contribution: Omit<ExtraContribution, 'id'>) => {
        setSavingsGoals(prev => prev.map(goal => {
            if (goal.id === goalId) {
                return {
                    ...goal,
                    extraContributions: [{ ...contribution, id: generateId() }, ...goal.extraContributions],
                };
            }
            return goal;
        }));
    }, []);`,
        to: `    const addExtraContribution = useCallback(async (goalId: number, contribution: Omit<ExtraContribution, 'id'>) => {
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
    }, [savingsGoals]);`
    },
    {
        from: `    const addLoan = useCallback((item: Omit<Loan, 'id' | 'repayments'>) => {
        const newItem = {
            ...item,
            id: generateId(), 
            repayments: []
        };
        setLoans(prev => [newItem, ...prev]);
    }, []);`,
        to: `    const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments'>) => {
        const newItem = {
            ...item,
            id: generateId(), 
            repayments: []
        };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'loans', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/loans'); }
    }, []);`
    },
    {
        from: `    const deleteLoan = useCallback((id: number) => {
        setLoans(prev => prev.filter(item => item.id !== id));
    }, []);`,
        to: `    const deleteLoan = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'loans', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/loans'); }
    }, []);`
    },
    {
        from: `    const addRepayment = useCallback((loanId: number, amount: number) => {
        setLoans(prev => prev.map(loan => {
            if (loan.id === loanId) {
                const newRepayment: Repayment = {
                    id: generateId(),
                    amount,
                    date: new Date().toISOString().split('T')[0]
                };
                return {
                    ...loan,
                    repayments: [newRepayment, ...loan.repayments],
                    outstandingAmount: Math.max(0, loan.outstandingAmount - amount)
                };
            }
            return loan;
        }));
    }, []);`,
        to: `    const addRepayment = useCallback(async (loanId: number, amount: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return;
            const newRepayment: Repayment = {
                id: generateId(),
                amount,
                date: new Date().toISOString().split('T')[0]
            };
            const updated = {
                ...loan,
                repayments: [newRepayment, ...(loan.repayments || [])],
                outstandingAmount: Math.max(0, loan.outstandingAmount - amount)
            };
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'loans', loanId.toString()), updated);
        } catch(e) { handleFirestoreError(e, OperationType.UPDATE, 'users/loans'); }
    }, [loans]);`
    },
    {
        from: `    const addSubscription = useCallback((item: Omit<Subscription, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setSubscriptions(prev => [newItem, ...prev]);
    }, []);`,
        to: `    const addSubscription = useCallback(async (item: Omit<Subscription, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'subscriptions', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/subscriptions'); }
    }, []);`
    },
    {
        from: `    const deleteSubscription = useCallback((id: number) => {
        setSubscriptions(prev => prev.filter(item => item.id !== id));
    }, []);`,
        to: `    const deleteSubscription = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'subscriptions', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/subscriptions'); }
    }, []);`
    },
    {
        from: `    const addScheduledTransaction = useCallback((item: Omit<ScheduledTransaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setScheduledTransactions(prev => [newItem, ...prev]);
    }, []);`,
        to: `    const addScheduledTransaction = useCallback(async (item: Omit<ScheduledTransaction, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'scheduledTransactions', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/scheduledTransactions'); }
    }, []);`
    },
    {
        from: `    const deleteScheduledTransaction = useCallback((id: number) => {
        setScheduledTransactions(prev => prev.filter(item => item.id !== id));
    }, []);`,
        to: `    const deleteScheduledTransaction = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'scheduledTransactions', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/scheduledTransactions'); }
    }, []);`
    },
    {
        from: `    const addInvestment = useCallback((item: Omit<Investment, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        setInvestments(prev => [newItem, ...prev]);
    }, []);`,
        to: `    const addInvestment = useCallback(async (item: Omit<Investment, 'id'>) => {
        const newItem = { ...item, id: generateId() };
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await setDoc(doc(db, 'users', auth.currentUser.uid, 'investments', newItem.id.toString()), newItem);
        } catch(e) { handleFirestoreError(e, OperationType.CREATE, 'users/investments'); }
    }, []);`
    },
    {
        from: `    const deleteInvestment = useCallback((id: number) => {
        setInvestments(prev => prev.filter(item => item.id !== id));
    }, []);`,
        to: `    const deleteInvestment = useCallback(async (id: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'investments', id.toString()));
        } catch(e) { handleFirestoreError(e, OperationType.DELETE, 'users/investments'); }
    }, []);`
    }
];

let replaced = 0;
for (const rep of replacements) {
    if (appCode.includes(rep.from)) {
        appCode = appCode.replace(rep.from, rep.to);
        replaced++;
    } else {
        console.error("Could not find block:\n" + rep.from);
    }
}
console.log("Replaced:", replaced);
fs.writeFileSync('App.tsx', appCode);
