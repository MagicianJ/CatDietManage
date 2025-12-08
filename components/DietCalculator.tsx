
import React, { useState } from 'react';
import { Cat } from '../types';
import { getLifeStage } from '../constants';
import { PieChart, Info, Beaker } from 'lucide-react';

interface DietCalculatorProps {
  cat: Cat;
  updateCat: (cat: Cat) => void;
}

const DietCalculator: React.FC<DietCalculatorProps> = ({ cat, updateCat }) => {
  const [activeTab, setActiveTab] = useState<'ratios' | 'supplements'>('ratios');
  
  // -- Ratio Logic --
  const handleRatioChange = (field: keyof typeof cat.dietRatios, value: number) => {
    updateCat({
      ...cat,
      dietRatios: {
        ...cat.dietRatios,
        [field]: value
      }
    });
  };

  const dailyTotal = Math.round(cat.weight * (cat.dietRatios.dailyIntakePercent / 100));
  const perMeal = Math.round(dailyTotal / 3);

  const totalPercentage = cat.dietRatios.redMeatPercent + 
                          cat.dietRatios.whiteMeatPercent + 
                          cat.dietRatios.heartPercent + 
                          cat.dietRatios.organPercent + 
                          cat.dietRatios.bonePercent;

  const getGrams = (percent: number) => Math.round(dailyTotal * (percent / 100));

  // -- Fixed Supplement Logic --
  const isAdult = getLifeStage(cat.birthDate) === 'adult';
  const muscleMeatRatio = cat.dietRatios.redMeatPercent + cat.dietRatios.whiteMeatPercent;
  const dailyMuscleMeat = dailyTotal * (muscleMeatRatio / 100);

  // Supplement Rules
  const supplements = [
    {
      name: '蛋壳粉',
      rule: '每100g肌肉肉需要0.6g',
      daily: (dailyMuscleMeat / 100) * 0.6,
      unit: 'g'
    },
    {
      name: '复合维生素B',
      rule: '两天一片',
      daily: 0.5,
      unit: '片'
    },
    {
      name: '维生素E',
      rule: '一周一片',
      daily: 1/7,
      unit: '片'
    },
    {
      name: '碘 (180片版)',
      rule: isAdult ? '成猫: 每700g肌肉肉1片' : '幼猫: 每700g肌肉肉2片',
      daily: isAdult ? (dailyMuscleMeat / 700) : ((dailyMuscleMeat / 700) * 2),
      unit: '片'
    },
    {
      name: '锰 (10mg版)',
      rule: isAdult ? '成猫: 每9000g肌肉肉1片' : '幼猫: 每6000g肉1片',
      daily: isAdult ? (dailyMuscleMeat / 9000) : (dailyMuscleMeat / 6000),
      unit: '片'
    },
    {
      name: '牛磺酸',
      rule: '每1000g肌肉肉需要0.5g',
      daily: (dailyMuscleMeat / 1000) * 0.5,
      unit: 'g'
    },
    {
      name: '鱼油',
      rule: '每周两颗',
      daily: 2/7,
      unit: '颗'
    }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('ratios')}
          className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'ratios' ? 'text-primary border-b-2 border-primary bg-rose-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          生肉食比例配置
        </button>
        <button
          onClick={() => setActiveTab('supplements')}
          className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'supplements' ? 'text-secondary border-b-2 border-secondary bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          补充剂配置
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'ratios' ? (
          <div className="space-y-8">
            {/* Daily Intake */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-gray-800">每日摄入量设置</h4>
                  <p className="text-sm text-gray-500">基于猫猫体重 ({cat.weight}g) 计算</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <input
                      type="number"
                      value={cat.dietRatios.dailyIntakePercent}
                      onChange={(e) => handleRatioChange('dailyIntakePercent', Number(e.target.value))}
                      className="w-20 p-2 pr-6 border border-gray-300 rounded-lg text-right font-bold text-gray-800 focus:ring-2 focus:ring-primary outline-none"
                    />
                    <span className="absolute right-2 top-2.5 text-gray-500 font-medium">%</span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{dailyTotal}g</div>
                    <div className="text-xs text-gray-500">每天</div>
                  </div>
                  <div className="w-px h-10 bg-gray-300 mx-2"></div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-700">{perMeal}g</div>
                    <div className="text-xs text-gray-500">每顿 (3顿/天)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Ratios */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <PieChart size={18} /> 食材占比
                </h4>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  当前总计: {totalPercentage}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: '红肉', field: 'redMeatPercent', color: 'bg-red-500' },
                  { label: '白肉', field: 'whiteMeatPercent', color: 'bg-orange-300' },
                  { label: '心脏', field: 'heartPercent', color: 'bg-red-700' },
                  { label: '非心脏内脏', field: 'organPercent', color: 'bg-purple-600' },
                  { label: '带肉骨', field: 'bonePercent', color: 'bg-stone-300' },
                ].map((item) => (
                  <div key={item.field} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                        {getGrams(cat.dietRatios[item.field as keyof typeof cat.dietRatios])}g / 天
                      </div>
                    </div>
                    <div className="relative mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={cat.dietRatios[item.field as keyof typeof cat.dietRatios]}
                        onChange={(e) => handleRatioChange(item.field as keyof typeof cat.dietRatios, Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-700"
                      />
                      <div className="flex justify-between mt-1 text-xs text-gray-500 font-mono">
                        <span>0%</span>
                        <input
                           type="number"
                           className="w-12 text-center border-b border-gray-300 focus:border-primary outline-none"
                           value={cat.dietRatios[item.field as keyof typeof cat.dietRatios]}
                           onChange={(e) => handleRatioChange(item.field as keyof typeof cat.dietRatios, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {totalPercentage !== 100 && (
                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg flex items-start gap-2">
                  <Info size={16} className="mt-0.5 shrink-0" />
                  <p>注意：当前各项比例之和为 {totalPercentage}%，请调整至 100% 以确保计算准确。</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex gap-3">
              <Beaker className="text-teal-600 shrink-0 mt-1" />
              <div>
                <h4 className="font-bold text-teal-800">补充剂计算规则 (只读)</h4>
                <p className="text-sm text-teal-600 mt-1">
                  以下补充剂根据猫猫的年龄段 (<span className="font-bold">{isAdult ? '成猫' : '幼猫'}</span>) 及每日摄入的肌肉肉 ({dailyMuscleMeat.toFixed(1)}g) 自动计算。
                  肌肉肉 = 红肉 + 白肉。
                </p>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">补充剂名称</th>
                    <th className="px-4 py-3">计算规则</th>
                    <th className="px-4 py-3 text-right">参考日均用量</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {supplements.map((supp, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{supp.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{supp.rule}</td>
                      <td className="px-4 py-3 text-right font-bold text-secondary">
                        {supp.daily < 0.01 ? '< 0.01' : supp.daily.toFixed(2)} {supp.unit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietCalculator;
