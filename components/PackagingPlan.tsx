import React from 'react';
import { Cat, SupplementMethod } from '../types';
import { Package, CalendarCheck, ShoppingBag } from 'lucide-react';

interface PackagingPlanProps {
  cat: Cat;
}

const PackagingPlan: React.FC<PackagingPlanProps> = ({ cat }) => {
  // Constants
  const MEALS_PER_DAY = 3;
  const FOOD_DAYS = 7;
  const SUPP_DAYS = 30;

  // Basic Calcs
  const dailyTotal = cat.weight * (cat.dietRatios.dailyIntakePercent / 100);
  const mealSize = dailyTotal / MEALS_PER_DAY;
  
  // Weekly Food Calcs
  const weeklyTotal = dailyTotal * FOOD_DAYS;
  const totalMeals = MEALS_PER_DAY * FOOD_DAYS;

  // Function to calculate bags
  // The user wants "How many bags" for each type if they separate them.
  // One bag = One meal (approx mealSize). 
  const getBags = (percentage: number) => {
    const totalNeeded = weeklyTotal * (percentage / 100);
    // Simple logic: Total grams needed divided by average meal size
    // Showing 1 decimal place for clarity, or rounding if close.
    const bags = totalNeeded / mealSize;
    return {
      grams: Math.round(totalNeeded),
      bags: Number(bags.toFixed(1))
    };
  };

  const categories = [
    { name: 'Red Meat', pct: cat.dietRatios.redMeatPercent },
    { name: 'White Meat', pct: cat.dietRatios.whiteMeatPercent },
    { name: 'Heart', pct: cat.dietRatios.heartPercent },
    { name: 'Other Organs', pct: cat.dietRatios.organPercent },
    { name: 'Raw Bone', pct: cat.dietRatios.bonePercent },
  ].filter(c => c.pct > 0);

  // Supplement 30 Days Calcs
  const getSuppTotal = (supp: any) => {
    let dailyAmount = 0;
    let unit = supp.unit;
    
    if (supp.method === SupplementMethod.FixedDaily) {
      dailyAmount = supp.value;
    } else {
      // % of food weight
      dailyAmount = dailyTotal * (supp.value / 100);
      unit = 'g'; // Always grams for ratio based usually
    }

    const monthlyAmount = dailyAmount * SUPP_DAYS;
    
    // Formatting
    if (unit === 'g' && monthlyAmount >= 1000) {
      return `${(monthlyAmount / 1000).toFixed(2)} kg`;
    }
    return `${monthlyAmount.toFixed(1)} ${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Food Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Package size={20} /> 7-Day Meal Prep Plan
          </h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200">
            Total {totalMeals} Bags ({Math.round(mealSize)}g / bag)
          </span>
        </div>
        <div className="p-6">
           <p className="text-sm text-gray-500 mb-4">
             Based on {cat.dietRatios.dailyIntakePercent}% body weight. 
             Prepare <strong>{totalMeals} bags</strong> total. Each bag is one meal. 
             Below is the breakdown of how many bags of each ingredient type you need to reach the weekly nutritional balance.
           </p>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                 <tr>
                   <th className="px-4 py-3">Ingredient Type</th>
                   <th className="px-4 py-3 text-right">Weekly Total (g)</th>
                   <th className="px-4 py-3 text-right">Target Bags</th>
                   <th className="px-4 py-3">Note</th>
                 </tr>
               </thead>
               <tbody>
                 {categories.map((catItem) => {
                   const data = getBags(catItem.pct);
                   return (
                     <tr key={catItem.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                       <td className="px-4 py-3 font-medium text-gray-800">{catItem.name}</td>
                       <td className="px-4 py-3 text-right text-gray-600">{data.grams}g</td>
                       <td className="px-4 py-3 text-right font-bold text-primary">{data.bags}</td>
                       <td className="px-4 py-3 text-gray-400 italic text-xs">
                         ~{Math.round(data.grams / Math.ceil(data.bags) || 1)}g per bag if split evenly
                       </td>
                     </tr>
                   );
                 })}
                 <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3">Total</td>
                    <td className="px-4 py-3 text-right">{Math.round(weeklyTotal)}g</td>
                    <td className="px-4 py-3 text-right">{categories.reduce((acc, c) => acc + getBags(c.pct).bags, 0).toFixed(1)}</td>
                    <td></td>
                 </tr>
               </tbody>
             </table>
           </div>
        </div>
      </div>

      {/* Supplement Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-teal-600 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <ShoppingBag size={20} /> 30-Day Supplement List
          </h3>
          <span className="text-xs bg-teal-700 px-2 py-1 rounded text-teal-100">
            For {cat.name}
          </span>
        </div>
        <div className="p-6">
          {cat.supplements.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No supplements configured.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cat.supplements.map(supp => (
                <div key={supp.id} className="p-4 border border-gray-100 rounded-xl bg-teal-50/30 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-bold text-gray-800">{supp.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Daily: {supp.method === SupplementMethod.FixedDaily 
                        ? `${supp.value} ${supp.unit}` 
                        : `${(dailyTotal * (supp.value / 100)).toFixed(2)}g (${supp.value}%)`}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teal-100">
                    <div className="text-xs text-teal-600 uppercase font-semibold">Monthly Required</div>
                    <div className="text-2xl font-bold text-teal-700">{getSuppTotal(supp)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackagingPlan;
