
import React from 'react';
import { Cat } from '../types';
import { getLifeStage } from '../constants';
import { Package, CalendarCheck, ShoppingBag } from 'lucide-react';

interface PackagingPlanProps {
  cat: Cat;
}

const PackagingPlan: React.FC<PackagingPlanProps> = ({ cat }) => {
  // Constants
  const MEALS_PER_DAY = 3;
  const FOOD_DAYS = 7;
  const SUPP_DAYS = 30;

  // Food Calcs
  const dailyTotal = cat.weight * (cat.dietRatios.dailyIntakePercent / 100);
  const mealSize = dailyTotal / MEALS_PER_DAY;
  
  // Weekly Food Calcs
  const weeklyTotal = dailyTotal * FOOD_DAYS;
  const totalMeals = MEALS_PER_DAY * FOOD_DAYS;

  // Function to calculate bags
  const getBags = (percentage: number) => {
    const totalNeeded = weeklyTotal * (percentage / 100);
    const bags = totalNeeded / mealSize;
    return {
      grams: Math.round(totalNeeded),
      bags: Number(bags.toFixed(1))
    };
  };

  const categories = [
    { name: '红肉', pct: cat.dietRatios.redMeatPercent },
    { name: '白肉', pct: cat.dietRatios.whiteMeatPercent },
    { name: '心脏', pct: cat.dietRatios.heartPercent },
    { name: '非心脏内脏', pct: cat.dietRatios.organPercent },
    { name: '带肉骨', pct: cat.dietRatios.bonePercent },
  ].filter(c => c.pct > 0);

  // -- Supplement 30 Days Calcs --
  const isAdult = getLifeStage(cat.birthDate) === 'adult';
  const muscleMeatRatio = cat.dietRatios.redMeatPercent + cat.dietRatios.whiteMeatPercent;
  const dailyMuscleMeat = dailyTotal * (muscleMeatRatio / 100);
  
  const supplements = [
    {
      name: '蛋壳粉',
      daily: (dailyMuscleMeat / 100) * 0.6,
      unit: 'g'
    },
    {
      name: '复合维生素B',
      daily: 0.5,
      unit: '片'
    },
    {
      name: '维生素E',
      daily: 1/7,
      unit: '片'
    },
    {
      name: '碘 (180片版)',
      daily: isAdult ? (dailyMuscleMeat / 700) : ((dailyMuscleMeat / 700) * 2),
      unit: '片'
    },
    {
      name: '锰 (10mg版)',
      daily: isAdult ? (dailyMuscleMeat / 9000) : (dailyMuscleMeat / 6000),
      unit: '片'
    },
    {
      name: '牛磺酸',
      daily: (dailyMuscleMeat / 1000) * 0.5,
      unit: 'g'
    },
    {
      name: '鱼油',
      daily: 2/7,
      unit: '颗'
    }
  ];

  const getSuppTotal = (dailyAmount: number, unit: string) => {
    const total = dailyAmount * SUPP_DAYS;
    if (unit === 'g' && total >= 1000) {
        return `${(total / 1000).toFixed(2)} kg`;
    }
    return `${total.toFixed(1)} ${unit}`;
  };

  return (
    <div className="space-y-6">
      {/* Food Plan */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">
            <Package size={20} /> 7天生骨肉分装计划
          </h3>
          <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-200">
            共 {totalMeals} 袋 (约{Math.round(mealSize)}g / 袋)
          </span>
        </div>
        <div className="p-6">
           <p className="text-sm text-gray-500 mb-4">
             基于 {cat.dietRatios.dailyIntakePercent}% 体重计算。 
             请准备 <strong>{totalMeals} 个分装袋</strong>。 每袋即为一顿的量。 
             以下为达到7天营养均衡所需的各类食材总量及分装袋数建议。
           </p>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                 <tr>
                   <th className="px-4 py-3">食材类别</th>
                   <th className="px-4 py-3 text-right">7天总量 (g)</th>
                   <th className="px-4 py-3 text-right">目标袋数</th>
                   <th className="px-4 py-3">备注</th>
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
                         ~{Math.round(data.grams / Math.ceil(data.bags) || 1)}g 每袋 (如需均匀分装)
                       </td>
                     </tr>
                   );
                 })}
                 <tr className="bg-gray-50 font-bold">
                    <td className="px-4 py-3">总计</td>
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
            <ShoppingBag size={20} /> 30天补充剂备餐清单
          </h3>
          <span className="text-xs bg-teal-700 px-2 py-1 rounded text-teal-100">
            {cat.name} ({isAdult ? '成猫' : '幼猫'})
          </span>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplements.map(supp => (
                <div key={supp.name} className="p-4 border border-gray-100 rounded-xl bg-teal-50/30 flex flex-col justify-between h-full">
                  <div>
                    <h4 className="font-bold text-gray-800">{supp.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                       日均消耗: {supp.daily.toFixed(3)} {supp.unit}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-teal-100">
                    <div className="text-xs text-teal-600 uppercase font-semibold">30天所需总量</div>
                    <div className="text-2xl font-bold text-teal-700">{getSuppTotal(supp.daily, supp.unit)}</div>
                  </div>
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PackagingPlan;
