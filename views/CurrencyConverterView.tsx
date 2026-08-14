import { multiplyMoney } from '../utils/money';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';

interface ExchangeRateCache {
    rates: Record<string, number>;
    timestamp: number;
}

const rateCache: Record<string, ExchangeRateCache> = {};
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const CurrencyConverter: React.FC = () => {
    const { t, currencySettings } = useLanguage();
    
    const currencies = ['ETB', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR'];
    
    const [amount, setAmount] = useState('100');
    const [fromCurrency, setFromCurrency] = useState('ETB');
    const [toCurrency, setToCurrency] = useState('USD');
    const [result, setResult] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const inputClasses = "mt-1 block w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md";

    const handleConvert = async () => {
        setLoading(true);
        setError(null);
        setResult(null);

        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            setError(t('converterErrorAmount') || 'Please enter a valid amount');
            setLoading(false);
            return;
        }

        if (fromCurrency === toCurrency) {
            setResult(formatCurrency(numAmount, { ...currencySettings, symbol: toCurrency }));
            setLoading(false);
            return;
        }

        try {
            let rates: Record<string, number>;
            const now = Date.now();
            const cached = rateCache[fromCurrency];
            
            if (cached && now - cached.timestamp < CACHE_TTL_MS) {
                rates = cached.rates;
            } else {
                const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${fromCurrency}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch exchange rates');
                }
                const data = await response.json();
                rates = data.rates;
                
                rateCache[fromCurrency] = {
                    rates: data.rates,
                    timestamp: now,
                };
            }
            
            const rate = rates[toCurrency];
            
            if (!rate || isNaN(rate)) {
                throw new Error('Exchange rate not found for selected currencies');
            }
            
            const convertedAmount = multiplyMoney(numAmount, rate);
            
            setResult(formatCurrency(convertedAmount, { ...currencySettings, symbol: toCurrency }));
        } catch (e) {
            console.error("Currency conversion error:", e);
            setError(t('converterErrorRate') || 'Failed to fetch conversion rate');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-white/60 dark:border-gray-700/50 p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] h-full flex flex-col">
             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{t('converterDescription') || 'Convert currencies with real-time exchange rates.'}</p>
             
             <div className="flex-grow flex flex-col justify-between">
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('amount') || 'Amount'}</label>
                            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClasses} placeholder="100.00"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('from') || 'From'}</label>
                            <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value)} className={inputClasses}>
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('to') || 'To'}</label>
                            <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value)} className={inputClasses}>
                                {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="self-end">
                            <button onClick={handleConvert} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed" disabled={loading}>
                                {loading ? <><i className="fas fa-spinner fa-spin"></i><span>{t('converting') || 'Converting'}...</span></> : <><i className="fas fa-exchange-alt"></i> <span>{t('convert') || 'Convert'}</span></>}
                            </button>
                        </div>
                    </div>
                </div>
                
                <div>
                    {error && <div className="mt-4 text-center p-3 bg-red-100 dark:bg-red-900/50 rounded-lg"><p className="font-semibold text-sm text-red-600 dark:text-red-400">{error}</p></div>}
                    {result && !error && <div className="mt-4 text-center p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg"><h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('result') || 'Result'}</h3><p className="text-2xl font-bold text-slate-600 dark:text-slate-400">{result}</p></div>}
                </div>
             </div>
        </div>
    );
};

export default CurrencyConverter;
