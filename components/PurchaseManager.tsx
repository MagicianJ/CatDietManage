
import React, { useState } from 'react';
import { PurchaseItem, InventoryModule, MeatCategory, InventoryItem, InventoryStatus, InboundRecord, InboundType, Cat, MeatType } from '../types';
import { generateId } from '../constants';
import { ShoppingCart, CheckSquare, Plus, Trash2, Calendar, Archive } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface PurchaseManagerProps {
  purchases: PurchaseItem[];
  setPurchases: (items: PurchaseItem[] | ((prev: PurchaseItem[]) => PurchaseItem[])) => void;
  cats: Cat[];
  meats: MeatType[];
  onConfirmArrival: (items: PurchaseItem[]) => void;
}

const PurchaseManager: React.FC<PurchaseManagerProps> = ({ purchases, setPurchases, cats, meats, onConfirmArrival }) => {
  const [activeTab, setActiveTab] = useState<'arrival' | 'details'>('arrival');
  const [detailModule, setDetailModule] = useState<InventoryModule>(InventoryModule.Meat);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  // --- Calculations ---
  const getDailyConsumption = (category: MeatCategory | 'Muscle' | 'Organ' | 'Bone'): number => {
    return cats.reduce((acc, cat) => {
      const dailyTotal = cat.weight * (cat.dietRatios.dailyIntakePercent / 100);
      let ratio = 0;
      switch (category) {
        case 'Muscle': ratio = cat.dietRatios.redMeatPercent + cat.dietRatios.whiteMeatPercent; break;
        case 'Organ': ratio = cat.dietRatios.heartPercent + cat.dietRatios.organPercent; break;
        case 'Bone': ratio = cat.dietRatios.bonePercent; break;
        default: return 0;
      }
      return acc + (dailyTotal * (ratio / 100));
    }, 0);
  };

  const calculateDays = (grams: number, daily: number) => {
    if (daily === 0) return 999;
    return (grams / daily).toFixed(1);
  };

  // --- Arrival Logic ---
  const handleBatchArrival = () => {
    if (selectedIds.length === 0) return;
    const itemsToConfirm = purchases.filter(p => selectedIds.includes(p.id));
    
    setConfirmConfig({
      isOpen: true,
      title: '确认入库',
      message: `确认将选中的 ${itemsToConfirm.length} 项采购计划标记为已到货并加入库存吗？`,
      action: () => {
        onConfirmArrival(itemsToConfirm);
        setPurchases(prev => prev.filter(p => !selectedIds.includes(p.id)));
        setSelectedIds([]);
      }
    });
  };

  const renderArrival = () => {
    const sorted = [...purchases].sort((a, b) => a.module.localeCompare(b.module) || a.expectedDate.localeCompare(b.expectedDate));
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-800 flex items-center gap-2">
             <CheckSquare size={20} /> 采购到货确认
           </h3>
           <div className="flex gap-2">
              <button onClick={() => setRefreshKey(r => r+1)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">刷新</button>
              <button 
                onClick={handleBatchArrival}
                disabled={selectedIds.length === 0}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${selectedIds.length > 0 ? 'bg-primary text-white hover:bg-rose-600' : 'bg-gray-200 text-gray-400'}`}
              >
                批量入库 ({selectedIds.length})
              </button>
           </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 w-8"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? sorted.map(i=>i.id) : [])} checked={selectedIds.length === sorted.length && sorted.length > 0} /></th>
                <th className="px-4 py-3">模块</th>
                <th className="px-4 py-3">预计到货</th>
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">品类</th>
                <th className="px-4 py-3 text-right">克数</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {sorted.map(item => (
                 <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => e.target.checked ? setSelectedIds([...selectedIds, item.id]) : setSelectedIds(selectedIds.filter(id => id !== item.id))} /></td>
                    <td className="px-4 py-3 text-gray-500">{item.module}</td>
                    <td className="px-4 py-3">{item.expectedDate}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-gray-500">{item.category}</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-700">{item.grams}</td>
                 </tr>
               ))}
               {sorted.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400 italic">暂无采购计划</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // --- Detail Logic ---
  const [newItem, setNewItem] = useState<Partial<PurchaseItem>>({ grams: 1000 });

  const handleAdd = () => {
    if (!newItem.name || !newItem.grams) return;
    const item: PurchaseItem = {
      id: generateId(),
      module: detailModule,
      category: newItem.category || (detailModule === InventoryModule.Bone ? MeatCategory.Bone : MeatCategory.Red),
      name: newItem.name,
      grams: Number(newItem.grams),
      expectedDate: newItem.expectedDate || new Date().toISOString().split('T')[0]
    };
    setPurchases(prev => [...prev, item]);
    setNewItem({ grams: 1000 });
  };

  const deletePurchase = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: '删除采购计划',
      message: '确定要删除这条采购计划吗？',
      action: () => {
        setPurchases(prev => prev.filter(p => p.id !== id));
      }
    });
  };

  const renderDetails = () => {
    const items = purchases.filter(p => p.module === detailModule);
    
    // Stats
    let stats = null;
    let totalGrams = items.reduce((s, i) => s + i.grams, 0);
    let label = '';
    let daily = 0;

    if (detailModule === InventoryModule.Meat) {
      const red = items.filter(i => i.category === MeatCategory.Red).reduce((s, i) => s + i.grams, 0);
      const white = items.filter(i => i.category === MeatCategory.White).reduce((s, i) => s + i.grams, 0);
      label = `红肉: ${red}g | 白肉: ${white}g`;
      daily = getDailyConsumption('Muscle');
    } else if (detailModule === InventoryModule.Organ) {
      const heart = items.filter(i => i.category === MeatCategory.Heart).reduce((s, i) => s + i.grams, 0);
      const other = items.filter(i => i.category === MeatCategory.Organ).reduce((s, i) => s + i.grams, 0);
      label = `心脏: ${heart}g | 非心脏: ${other}g`;
      daily = getDailyConsumption('Organ');
    } else {
      label = `骨骼: ${totalGrams}g`;
      daily = getDailyConsumption('Bone');
    }

    const days = calculateDays(totalGrams, daily);
    stats = (
      <div className="bg-teal-700 text-white px-4 py-3 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="text-sm font-mono">{label} | 总计: {totalGrams}g</div>
          <div className="text-sm font-bold bg-teal-800 px-3 py-1 rounded">预计可食: {days} 天</div>
      </div>
    );

    return (
      <div className="space-y-4">
        {/* Module Switcher */}
        <div className="flex gap-2">
           {[InventoryModule.Meat, InventoryModule.Organ, InventoryModule.Bone].map(m => (
             <button 
               key={m}
               onClick={() => setDetailModule(m)} 
               className={`px-4 py-2 rounded-t-lg font-bold text-sm ${detailModule === m ? 'bg-white border-t border-x border-gray-200 text-primary' : 'bg-gray-100 text-gray-500'}`}
             >
               {m}采购
             </button>
           ))}
        </div>

        <div className="bg-white p-6 rounded-b-xl rounded-tr-xl shadow-sm border border-gray-200">
           {stats}

           {/* Add Form */}
           <div className="mt-6 p-4 bg-teal-50 rounded-xl border border-teal-100">
              <h4 className="font-bold text-gray-800 mb-3 text-sm">新增采购项</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                 {detailModule === InventoryModule.Meat ? (
                   <div className="col-span-2">
                      <select className="w-full p-2 border rounded text-sm" value={newItem.name || ''} onChange={e => {
                        const m = meats.find(x => x.name === e.target.value);
                        setNewItem({...newItem, name: m?.name, category: m?.category});
                      }}>
                        <option value="">选择肉类...</option>
                        {meats.map(m => <option key={m.id} value={m.name}>{m.name} ({m.category})</option>)}
                      </select>
                   </div>
                 ) : detailModule === InventoryModule.Organ ? (
                    <>
                      <select className="w-full p-2 border rounded text-sm" value={newItem.category || ''} onChange={e => setNewItem({...newItem, category: (e.target.value == MeatCategory.Organ? MeatCategory.Organ : MeatCategory.Heart)})}>
                          <option value={MeatCategory.Heart}>心脏</option>
                         <option value={MeatCategory.Organ}>非心脏内脏</option>
                      </select>
                      <input type="text" placeholder="名称" className="w-full p-2 border rounded text-sm" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value, category: newItem.category?newItem.category :MeatCategory.Heart})} />
                    </>
                 ) : (
                    <div className="col-span-2">
                       <input type="text" placeholder="名称 (例如: 鸭架)" className="w-full p-2 border rounded text-sm" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value, category: MeatCategory.Bone})} />
                    </div>
                 )}
                 <input type="number" placeholder="克数" className="w-full p-2 border rounded text-sm" value={newItem.grams} onChange={e => setNewItem({...newItem, grams: Number(e.target.value)})} />
                 <input type="date" className="w-full p-2 border rounded text-sm" value={newItem.expectedDate || new Date().toISOString().split('T')[0]} onChange={e => setNewItem({...newItem, expectedDate: e.target.value})} />
              </div>
              <div className="mt-3 flex justify-end">
                <button onClick={handleAdd} className="bg-teal-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-teal-700 flex items-center gap-2"><Plus size={16}/> 添加</button>
              </div>
           </div>

           {/* List */}
           <div className="mt-6 space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                   <div>
                     <div className="font-medium text-gray-800">{item.name} <span className="text-gray-400 text-xs">({item.category})</span></div>
                     <div className="text-xs text-gray-500">预计: {item.expectedDate}</div>
                   </div>
                   <div className="flex items-center gap-4">
                     <span className="font-bold text-gray-700">{item.grams}g</span>
                     <button onClick={(e) => deletePurchase(item.id, e)} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
       <div className="flex border-b border-gray-200">
         <button onClick={() => setActiveTab('arrival')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'arrival' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
           采购到货确认
         </button>
         <button onClick={() => setActiveTab('details')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'details' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500'}`}>
           采购计划明细
         </button>
       </div>

       {activeTab === 'arrival' && renderArrival()}
       {activeTab === 'details' && renderDetails()}

       <ConfirmModal 
         isOpen={confirmConfig.isOpen}
         title={confirmConfig.title}
         message={confirmConfig.message}
         onConfirm={confirmConfig.action}
         onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
         confirmText="确认"
         cancelText="取消"
       />
    </div>
  );
};

export default PurchaseManager;
