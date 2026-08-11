const fs = require('fs');

let content = fs.readFileSync('views/InvestmentsView.tsx', 'utf8');

const budgetLogic = `
    const budgetData = useMemo(() => {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        const previousDate = new Date(currentYear, currentMonth - 1, 1);
        const previousMonth = previousDate.getMonth();
        const previousYear = previousDate.getFullYear();

        const currentMonthIncomeList = income.filter(tx => {
            const date = new Date(tx.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const currentMonthExpensesList = expenses.filter(tx => {
            const date = new Date(tx.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });

        const previousMonthIncomeList = income.filter(tx => {
            const date = new Date(tx.date);
            return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
        });

        const currentMonthIncomeTotal = currentMonthIncomeList.reduce((sum, tx) => addMoney(sum, tx.amount), 0);
        const currentMonthExpensesTotal = currentMonthExpensesList.reduce((sum, tx) => addMoney(sum, tx.amount), 0);
        const previousMonthIncomeTotal = previousMonthIncomeList.reduce((sum, tx) => addMoney(sum, tx.amount), 0);

        let thresholdAlert = null;
        if (previousMonthIncomeTotal > 0) {
            const expenseRatio = currentMonthExpensesTotal / previousMonthIncomeTotal;
            if (expenseRatio >= 0.9) {
                thresholdAlert = "Critical: Current month expenses reached 90% of last month's income!";
            } else if (expenseRatio >= 0.8) {
                thresholdAlert = "Warning: Current month expenses reached 80% of last month's income.";
            }
        }

        // 50/30/20 Rule based on current month's income
        const needs = multiplyMoney(currentMonthIncomeTotal, 0.5);
        const wants = multiplyMoney(currentMonthIncomeTotal, 0.3);
        const goals = multiplyMoney(currentMonthIncomeTotal, 0.2);

        return {
            currentMonthIncomeTotal,
            currentMonthExpensesTotal,
            previousMonthIncomeTotal,
            thresholdAlert,
            needs,
            wants,
            goals,
            budgetChartData: [
                { name: 'Needs (50%)', value: needs, color: '#f43f5e' },
                { name: 'Wants (30%)', value: wants, color: '#f59e0b' },
                { name: 'Goals (20%)', value: goals, color: '#10b981' }
            ]
        };
    }, [income, expenses]);
`;

content = content.replace(
    '    const portfolioSummary = useMemo(() => {',
    budgetLogic + '\n    const portfolioSummary = useMemo(() => {'
);

const budgetUI = `
            {/* Budget & Threshold Section */}
            {budgetData.thresholdAlert && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-sm" role="alert">
                    <p className="font-bold">Budget Alert</p>
                    <p>{budgetData.thresholdAlert}</p>
                </div>
            )}

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
                <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-4">
                    <i className="fas fa-wallet mr-2 text-purple-500"></i> Monthly Budget (50/30/20 Rule)
                </h3>
                {budgetData.currentMonthIncomeTotal === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">No income recorded for this month to calculate the budget.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={budgetData.budgetChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {budgetData.budgetChartData.map((entry, index) => (
                                            <Cell key={\`cell-\${index}\`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => formatCurrency(Number(value), currencySettings)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-rose-600 dark:text-rose-400">Needs (50%)</h4>
                                    <p className="text-xs text-rose-500 dark:text-rose-300">Food, rent, utilities, etc.</p>
                                </div>
                                <span className="font-bold text-lg text-rose-700 dark:text-rose-300">
                                    {formatCurrency(budgetData.needs, currencySettings)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-amber-600 dark:text-amber-400">Wants (30%)</h4>
                                    <p className="text-xs text-amber-500 dark:text-amber-300">Vacations, new cars, etc.</p>
                                </div>
                                <span className="font-bold text-lg text-amber-700 dark:text-amber-300">
                                    {formatCurrency(budgetData.wants, currencySettings)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                                <div>
                                    <h4 className="font-bold text-emerald-600 dark:text-emerald-400">Goals (20%)</h4>
                                    <p className="text-xs text-emerald-500 dark:text-emerald-300">Savings, investments, etc.</p>
                                </div>
                                <span className="font-bold text-lg text-emerald-700 dark:text-emerald-300">
                                    {formatCurrency(budgetData.goals, currencySettings)}
                                </span>
                            </div>
                            <div className="pt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
                                Based on current month income: <span className="font-bold">{formatCurrency(budgetData.currentMonthIncomeTotal, currencySettings)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
`;

content = content.replace(
    '            <div className="flex justify-between items-center">',
    budgetUI + '\n            <div className="flex justify-between items-center mt-8">'
);

fs.writeFileSync('views/InvestmentsView.tsx', content);

