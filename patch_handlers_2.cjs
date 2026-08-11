const fs = require('fs');
let appCode = fs.readFileSync('App.tsx', 'utf8');

const replacements = [
    {
        from: `    const addExtraContribution = useCallback((goalId: number, contribution: Omit<ExtraContribution, 'id'>) => {
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
        from: `    const addLoan = useCallback((item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
        const newItem: Loan = { 
            ...item, 
            id: generateId(), 
            repayments: [], 
            outstandingAmount: item.totalAmount 
        };
        setLoans(prev => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, []);`,
        to: `    const addLoan = useCallback(async (item: Omit<Loan, 'id' | 'repayments' | 'outstandingAmount'>) => {
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
    }, []);`
    },
    {
        from: `    const addRepayment = useCallback((loanId: number, amount: number) => {
        setLoans(prevLoans => 
            prevLoans.map(loan => {
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
            })
        );
    }, []);`,
        to: `    const addRepayment = useCallback(async (loanId: number, amount: number) => {
        try {
            if (!auth.currentUser) throw new Error("Not logged in");
            const loan = loans.find(l => l.id === loanId);
            if (!loan) return;
            const newRepayment = {
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
