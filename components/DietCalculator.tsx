import React, { useState } from 'react';
import { Cat, Supplement, SupplementUnit, SupplementMethod } from '../types';
import { generateId } from '../constants';
import { Plus, Trash2, PieChart, Info } from 'lucide-react';

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

  // -- Supplement Logic --
  const [newSupp, setNewSupp] = useState<Partial<Supplement>>({
    name: '',
    unit: SupplementUnit.Gram,
    method: SupplementMethod.FixedDaily,
    value: 0
  });

  const addSupplement = () => {
    if (!newSupp.name || newSupp.value === undefined) return;
    const supp: Supplement = {
      id: generateId(),
      name: newSupp.name,
      unit: newSupp.unit!,
      method: newSupp.method!,
      value: Number(newSupp.value)
    };
    updateCat({
      ...cat,
      supplements: [...cat.supplements, supp]
    });
    setNewSupp({ name: '', unit: SupplementUnit.Gram, method: SupplementMethod.FixedDaily, value: 0 });
  };

  const removeSupplement = (id: string) => {
    updateCat({
      ...cat,
      supplements: cat.supplements.filter(s => s.id !== id)
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab('ratios')}
          className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'ratios' ? 'text-primary border-b-2 border-primary bg-rose-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Raw Ratio Configuration
        </button>
        <button
          onClick={() => setActiveTab('supplements')}
          className={`flex-1 py-4 font-medium text-sm transition-colors ${activeTab === 'supplements' ? 'text-secondary border-b-2 border-secondary bg-teal-50/50' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Supplements
        </button>
      </div>

      <div className="p-6">
        {activeTab === 'ratios' ? (
          <div className="space-y-8">
            {/* Daily Intake */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h4 className="font-bold text-gray-800">Daily Intake Setting</h4>
                  <p className="text-sm text-gray-500">Based on cat weight ({cat.weight}g)</p>
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
                    <div className="text-xs text-gray-500">per day</div>
                  </div>
                  <div className="w-px h-10 bg-gray-300 mx-2"></div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-700">{perMeal}g</div>
                    <div className="text-xs text-gray-500">per meal (3x)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Component Ratios */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                  <PieChart size={18} /> Component Balance
                </h4>
                <div className={`text-sm font-bold px-3 py-1 rounded-full ${totalPercentage === 100 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  Total: {totalPercentage}%
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { label: 'Red Meat', field: 'redMeatPercent', color: 'bg-red-500' },
                  { label: 'White Meat', field: 'whiteMeatPercent', color: 'bg-orange-300' },
                  { label: 'Heart', field: 'heartPercent', color: 'bg-red-700' },
                  { label: 'Other Organs', field: 'organPercent', color: 'bg-purple-600' },
                  { label: 'Raw Bone', field: 'bonePercent', color: 'bg-stone-300' },
                ].map((item) => (
                  <div key={item.field} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded">
                        {getGrams(cat.dietRatios[item.field as keyof typeof cat.dietRatios])}g / day
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
                  <p>Warning: Your component percentages sum to {totalPercentage}%, not 100%. Please adjust them to ensure a complete ration calculation.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Add Supplement Form */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-800 mb-4">Add Supplement</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="md:col-span-1">
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Taurine"
                    value={newSupp.name}
                    onChange={(e) => setNewSupp({...newSupp, name: e.target.value})}
                    className="w-full p-2 border rounded-lg text-sm"
                  />
                </div>
                <div>
                   <label className="text-xs font-medium text-gray-500 mb-1 block">Calculation Method</label>
                   <select
                     value={newSupp.method}
                     onChange={(e) => setNewSupp({...newSupp, method: e.target.value as SupplementMethod})}
                     className="w-full p-2 border rounded-lg text-sm"
                   >
                     <option value={SupplementMethod.FixedDaily}>Fixed Daily Amount</option>
                     <option value={SupplementMethod.ByFoodRatio}>% of Food Weight</option>
                   </select>
                </div>
                <div>
                   <label className="text-xs font-medium text-gray-500 mb-1 block">
                     {newSupp.method === SupplementMethod.FixedDaily ? 'Amount' : 'Percentage'}
                   </label>
                   <div className="flex">
                     <input
                       type="number"
                       step="0.01"
                       value={newSupp.value}
                       onChange={(e) => setNewSupp({...newSupp, value: Number(e.target.value)})}
                       className="w-full p-2 border-l border-t border-b rounded-l-lg text-sm"
                     />
                     <select
                        value={newSupp.unit}
                        onChange={(e) => setNewSupp({...newSupp, unit: e.target.value as SupplementUnit})}
                        className="p-2 border rounded-r-lg bg-gray-100 text-sm"
                        disabled={newSupp.method === SupplementMethod.ByFoodRatio}
                     >
                       {newSupp.method === SupplementMethod.ByFoodRatio ? (
                          <option>%</option>
                       ) : (
                         Object.values(SupplementUnit).map(u => <option key={u} value={u}>{u}</option>)
                       )}
                     </select>
                   </div>
                </div>
                <button
                  onClick={addSupplement}
                  className="bg-secondary text-white py-2 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>

            {/* List */}
            <div>
              <h4 className="font-bold text-gray-800 mb-3">Active Supplements</h4>
              {cat.supplements.length === 0 ? (
                <p className="text-gray-400 italic text-sm">No supplements added.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {cat.supplements.map(supp => {
                    // Preview calc
                    let calculatedPreview = '';
                    if (supp.method === SupplementMethod.ByFoodRatio) {
                      const amount = (dailyTotal * (supp.value / 100)).toFixed(2);
                      calculatedPreview = `${amount}g / day`;
                    } else {
                       calculatedPreview = `${supp.value} ${supp.unit} / day`;
                    }

                    return (
                      <div key={supp.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg bg-white">
                        <div>
                          <div className="font-semibold text-gray-700">{supp.name}</div>
                          <div className="text-xs text-gray-500">
                             {supp.method === SupplementMethod.FixedDaily 
                               ? `Fixed: ${supp.value}${supp.unit}` 
                               : `Ratio: ${supp.value}% of food`}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-secondary">{calculatedPreview}</span>
                          <button onClick={() => removeSupplement(supp.id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DietCalculator;
