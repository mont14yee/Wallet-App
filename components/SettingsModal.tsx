
import React, { useState } from 'react';
import { Transaction, MealPlan } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface NutritionViewProps {
    shoppingList: Transaction[];
}

const NutritionView: React.FC<NutritionViewProps> = ({ shoppingList }) => {
    const { t } = useLanguage();
    const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateMealPlan = async () => {
        setIsLoading(true);
        setError(null);
        setMealPlan(null);

        const shoppingItems = shoppingList.map(item => item.name).join(', ');
        if (!shoppingItems) {
            setError(t('mealPlanErrorEmptyList'));
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/meal-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ shoppingItems })
            });
            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            const jsonStr = data.text.trim();
            const parsedPlan = JSON.parse(jsonStr) as MealPlan;
            setMealPlan(parsedPlan);
        } catch (e) {
            console.error("Error generating meal plan:", e);
            setError(t('mealPlanErrorGeneric'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-transparent h-full">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-6">
                    <div className="text-center">
                         <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-400 flex items-center justify-center gap-3 mb-2">
                            <i className="fas fa-seedling"></i>
                            {t('healthAndNutritionGoal')}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('mealPlannerDescription')}</p>
                        <button 
                            onClick={handleGenerateMealPlan}
                            className="bg-blue-600 text-white font-bold py-2 px-5 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:bg-blue-400 disabled:cursor-not-allowed mx-auto"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i> {t('generating')}...
                                </>
                            ) : (
                                 <>
                                    <i className="fas fa-robot"></i> {t('generateMealPlan')}
                                 </>
                            )}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 text-center p-3 bg-red-100 dark:bg-red-900/50 rounded-lg">
                        <p className="font-semibold text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {mealPlan && (
                    <div className="mt-6 space-y-4 animate-fadeIn">
                        {mealPlan.mealPlan.map((meal, index) => (
                            <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
                                <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                    <i className="fas fa-utensils"></i> {meal.mealType}: {meal.recipeName}
                                </h4>
                                <p className="text-sm font-semibold text-orange-500 mb-2">{meal.calories} {t('calories')}</p>
                                <div className="mt-2">
                                    <h5 className="font-semibold mb-1 dark:text-gray-300">{t('ingredients')}:</h5>
                                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                        {meal.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
                                    </ul>
                                </div>
                                <div className="mt-3">
                                    <h5 className="font-semibold mb-1 dark:text-gray-300">{t('instructions')}:</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{meal.instructions}</p>
                                </div>
                            </div>
                        ))}
                         <div className="text-center p-4 bg-gradient-to-r from-slate-100 to-blue-100 dark:from-slate-900/30 dark:to-blue-900/30 rounded-2xl mt-4 shadow-md">
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('totalDailyCalories')}</h3>
                            <div className="text-3xl font-bold my-1 text-slate-600 dark:text-slate-400">
                                {mealPlan.totalCalories.toLocaleString()} {t('calories')}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NutritionView;