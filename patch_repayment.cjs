const fs = require('fs');
let appCode = fs.readFileSync('App.tsx', 'utf8');

const from = `    const addRepaymentToLoan = useCallback((loanId: number, repayment: Omit<Repayment, 'id'>) => {
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
                    name: \`\${t('repaymentFrom')} \${targetLoan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Debt Repayment'
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: \`\${t('repaymentTo')} \${targetLoan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Debt Repayment'
                });
            }
        }
    }, [addTransaction, t]);`;

const to = `    const addRepaymentToLoan = useCallback(async (loanId: number, repayment: Omit<Repayment, 'id'>) => {
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
                    name: \`\${t('repaymentFrom')} \${loan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Debt Repayment'
                });
            } else {
                addTransaction(TransactionType.Expense, {
                    name: \`\${t('repaymentTo')} \${loan.person}\`,
                    amount: repayment.amount,
                    date: repayment.date,
                    category: 'Debt Repayment'
                });
            }
        } catch (e) {
            handleFirestoreError(e, OperationType.UPDATE, 'users/loans');
        }
    }, [loans, addTransaction, t]);`;

if (appCode.includes(from)) {
    appCode = appCode.replace(from, to);
    fs.writeFileSync('App.tsx', appCode);
    console.log("Success");
} else {
    console.log("Not found");
}
