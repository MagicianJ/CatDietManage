
import React, { useState } from 'react';
import { InventoryItem, InventoryModule, InventoryStatus, InboundRecord, InboundType, MeatCategory, Cat, MeatType } from '../types';
import { generateId } from '../constants';
import { AlertCircle, RefreshCw, Plus, Filter, ClipboardList, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface InventoryManagerProps {
  inventory: InventoryItem[];
  setInventory: (items: InventoryItem[] | ((prev: InventoryItem[]) => InventoryItem[])) => void;
  inboundRecords: InboundRecord[];
  setInboundRecords: (records: InboundRecord[] | ((prev: InboundRecord[]) => InboundRecord[])) => void;
  cats: Cat[];
  meats: MeatType[];
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ inventory, setInventory, inboundRecords, setInboundRecords, cats, meats }) => {
  const [activeModule, setActiveModule] = useState<'summary' | InventoryModule | 'records'>('summary');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  // --- Helpers ---
  const getDailyConsumption = (category: MeatCategory | 'Muscle' | 'Organ'): number => {
    return cats.reduce((acc, cat) => {
      const dailyTotal = cat.weight * (cat.dietRatios.dailyIntakePercent / 100);
      let ratio = 0;
      switch (category) {
        case 'Muscle':
          ratio = cat.dietRatios.redMeatPercent + cat.dietRatios.whiteMeatPercent;
          break;
        case 'Organ':
          ratio = cat.dietRatios.heartPercent + cat.dietRatios.organPercent;
          break;
        case MeatCategory.Red: ratio = cat.dietRatios.redMeatPercent; break;
        case MeatCategory.White: ratio = cat.dietRatios.whiteMeatPercent; break;
        case MeatCategory.Heart: ratio = cat.dietRatios.heartPercent; break;
        case MeatCategory.Organ: ratio = cat.dietRatios.organPercent; break;
        case MeatCategory.Bone: ratio = cat.dietRatios.bonePercent; break;
      }
      return acc + (dailyTotal * (ratio / 100));
    }, 0);
  };

  const calculateDays = (grams: number, dailyUsage: number) => {
    if (dailyUsage === 0) return 999;
    return grams / dailyUsage;
  };

  const addDate = (dateStr: string, days: number) => {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const getDaysDiff = (targetDate: string) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  // --- Summary Logic ---
  const renderSummary = () => {
    // 1. In Stock Days
    const inStockItems = inventory.filter(i => i.status === InventoryStatus.InStock);
    const totalMuscle = inStockItems.filter(i => i.module === InventoryModule.Meat).reduce((sum, i) => sum + i.grams, 0);
    const totalOrgan = inStockItems.filter(i => i.module === InventoryModule.Organ).reduce((sum, i) => sum + i.grams, 0);
    const totalBone = inStockItems.filter(i => i.module === InventoryModule.Bone).reduce((sum, i) => sum + i.grams, 0);

    const dailyMuscle = getDailyConsumption('Muscle');
    const dailyOrgan = getDailyConsumption('Organ');
    const dailyBone = getDailyConsumption(MeatCategory.Bone);

    const checkSupply = (total: number, daily: number, label: string) => {
      const days = calculateDays(total, daily);
      const remainder = total % (daily * 7); // Remainder of a 7-day week batch
      const missingForWeek = (daily * 7) - remainder;
      
      const isMultiple = Math.abs(missingForWeek - (daily*7)) < 1 || Math.abs(missingForWeek) < 1;
      
      return (
        <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-2">{label}</h4>
          <div className="flex justify-between items-end mb-2">
            <div>
              <span className="text-2xl font-bold text-primary">{Math.floor(days)}</span>
              <span className="text-sm text-gray-500"> 天可用 ({total}g)</span>
            </div>
            <div className="text-xs text-gray-400">日耗: {Math.round(daily)}g</div>
          </div>
          {!isMultiple && days < 100 && (
             <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded flex items-start gap-1">
               <AlertCircle size={12} className="mt-0.5" />
               <span>建议补充 <b>{Math.round(missingForWeek)}g</b> 以凑齐7天倍数。</span>
             </div>
          )}
        </div>
      );
    };

    // 2. Consuming Items
    const consumingItems = inventory.filter(i => i.status === InventoryStatus.Consuming && i.startConsumeDate);
    
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">库存概况</h3>
          <button onClick={() => setRefreshKey(k => k + 1)} className="p-2 text-primary hover:bg-rose-50 rounded-full transition-colors">
            <RefreshCw size={20} />
          </button>
        </div>

        {/* Availability Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {checkSupply(totalMuscle, dailyMuscle, '肌肉肉可用')}
          {checkSupply(totalOrgan, dailyOrgan, '内脏可用')}
          {checkSupply(totalBone, dailyBone, '骨骼可用')}
        </div>

        {/* Consuming Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ClipboardList size={20} /> 消耗中物品监控
          </h4>
          {consumingItems.length === 0 ? (
            <p className="text-gray-400 text-sm italic">当前没有正在消耗的大包食材。</p>
          ) : (
            <div className="space-y-3">
              {consumingItems.map(item => {
                let daily = 0;
                if (item.module === InventoryModule.Meat) daily = getDailyConsumption(item.category); // Specific red/white
                else if (item.module === InventoryModule.Bone) daily = getDailyConsumption(MeatCategory.Bone);
                else daily = getDailyConsumption(item.category); // Heart or Organ

                const totalDays = calculateDays(item.grams, daily);
                const endDate = addDate(item.startConsumeDate!, totalDays);
                const daysLeft = getDaysDiff(endDate);
                
                const isOverdue = daysLeft < 0;
                const isLow = daysLeft <= 3 && daysLeft >= 0;

                return (
                  <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${item.status === InventoryStatus.Consuming ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                      <div>
                        <div className="font-medium text-gray-800">{item.name} <span className="text-xs text-gray-500">({item.grams}g)</span></div>
                        <div className="text-xs text-gray-500">预计结束: {endDate}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 sm:mt-0">
                      {isOverdue ? (
                         <div className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded">已超期 {Math.abs(daysLeft)} 天</div>
                      ) : (
                         <div className={`text-xs font-bold px-2 py-1 rounded ${isLow ? 'text-orange-600 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                           剩余 {daysLeft} 天
                         </div>
                      )}
                      
                      {isOverdue && (
                        <button 
                          onClick={() => handleStatusChange([item.id], InventoryStatus.Consumed)}
                          className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-rose-600"
                        >
                          标记为已消耗
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // --- Detail List Logic ---
  const [filterName, setFilterName] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Add Form State
  const [isAddMode, setIsAddMode] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({ grams: 500, status: InventoryStatus.InStock });

  const handleStatusChange = (ids: string[], status: InventoryStatus) => {
    const now = new Date().toISOString().split('T')[0];
    setInventory(prev => prev.map(item => {
      if (ids.includes(item.id)) {
        const update: Partial<InventoryItem> = { status };
        if (status === InventoryStatus.Consuming) update.startConsumeDate = now;
        if (status === InventoryStatus.Consumed) update.endConsumeDate = now;
        return { ...item, ...update };
      }
      return item;
    }));
    setSelectedIds([]);
  };

  const deleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmConfig({
      isOpen: true,
      title: '删除库存记录',
      message: '确定删除此库存记录吗？此操作无法撤销。',
      action: () => {
        setInventory(prev => prev.filter(i => i.id !== id));
      }
    });
  };

  const saveNewItem = () => {
    if (!newItem.name || !newItem.grams) return;
    const item: InventoryItem = {
      id: generateId(),
      module: activeModule as InventoryModule,
      category: newItem.category || (activeModule === InventoryModule.Bone ? MeatCategory.Bone : MeatCategory.Red),
      name: newItem.name,
      grams: Number(newItem.grams),
      status: newItem.status || InventoryStatus.InStock,
      inStockDate: newItem.inStockDate || new Date().toISOString().split('T')[0],
      startConsumeDate: newItem.status === InventoryStatus.Consuming ? (newItem.startConsumeDate || new Date().toISOString().split('T')[0]) : undefined
    };

    setInventory(prev => [...prev, item]);
    
    // Add Inbound Record
    const record: InboundRecord = {
      id: generateId(),
      type: InboundType.Direct,
      module: item.module,
      category: item.category,
      name: item.name,
      grams: item.grams,
      date: item.inStockDate,
      adjustType: '新增'
    };
    setInboundRecords(prev => [record, ...prev]);
    
    setIsAddMode(false);
    setNewItem({ grams: 500, status: InventoryStatus.InStock });
  };

  const renderModuleList = (module: InventoryModule) => {
    const items = inventory.filter(i => i.module === module);
    const filtered = items.filter(i => {
      if (filterName && !i.name.includes(filterName)) return false;
      if (filterStatus !== 'all' && i.status !== filterStatus) return false;
      return true;
    });

    // Stats
    let stats = '';
    if (module === InventoryModule.Meat) {
      const red = items.filter(i => i.category === MeatCategory.Red && i.status === InventoryStatus.InStock).reduce((s, i) => s + i.grams, 0);
      const white = items.filter(i => i.category === MeatCategory.White && i.status === InventoryStatus.InStock).reduce((s, i) => s + i.grams, 0);
      stats = `红肉库存: ${red}g | 白肉库存: ${white}g | 总计: ${red + white}g`;
    } else if (module === InventoryModule.Organ) {
       const heart = items.filter(i => i.category === MeatCategory.Heart && i.status === InventoryStatus.InStock).reduce((s, i) => s + i.grams, 0);
       const other = items.filter(i => i.category === MeatCategory.Organ && i.status === InventoryStatus.InStock).reduce((s, i) => s + i.grams, 0);
       stats = `心脏库存: ${heart}g | 非心脏库存: ${other}g | 总计: ${heart + other}g`;
    } else {
       const bone = items.filter(i => i.category === MeatCategory.Bone && i.status === InventoryStatus.InStock).reduce((s, i) => s + i.grams, 0);
       stats = `骨骼库存: ${bone}g`;
    }

    return (
      <div className="space-y-4">
        {/* Stats Bar */}
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-mono shadow-sm">
          {stats}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
           <div className="flex-1 flex gap-2">
             <div className="relative flex-1">
               <Filter size={16} className="absolute left-3 top-3 text-gray-400" />
               <input 
                 type="text" 
                 placeholder="搜索名称..." 
                 className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
                 value={filterName}
                 onChange={e => setFilterName(e.target.value)}
               />
             </div>
             <select 
               className="border rounded-lg px-3 py-2 text-sm"
               value={filterStatus}
               onChange={e => setFilterStatus(e.target.value)}
             >
               <option value="all">所有状态</option>
               {Object.values(InventoryStatus).map(s => <option key={s} value={s}>{s}</option>)}
             </select>
           </div>
           
           <div className="flex gap-2">
             {selectedIds.length > 0 && (
               <select 
                 className="bg-gray-100 border-none rounded-lg px-3 py-2 text-sm font-medium"
                 onChange={(e) => {
                   if(e.target.value) handleStatusChange(selectedIds, e.target.value as InventoryStatus);
                 }}
                 value=""
               >
                 <option value="" disabled>批量变更为...</option>
                 {Object.values(InventoryStatus).map(s => <option key={s} value={s}>{s}</option>)}
               </select>
             )}
             <button onClick={() => setIsAddMode(true)} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-rose-600">
               <Plus size={16} /> 入库
             </button>
           </div>
        </div>

        {/* Add Form */}
        {isAddMode && (
          <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 animate-fade-in">
             <h4 className="font-bold text-gray-800 mb-3 text-sm">新增库存 - {module}</h4>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
               
               {/* Name / Category Selection Logic */}
               {module === InventoryModule.Meat ? (
                 <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">肉类选择</label>
                    <select 
                      className="w-full p-2 border rounded text-sm"
                      value={newItem.name || ''}
                      onChange={e => {
                        const m = meats.find(x => x.name === e.target.value);
                        setNewItem({...newItem, name: m?.name, category: m?.category});
                      }}
                    >
                      <option value="">请选择...</option>
                      {meats.map(m => <option key={m.id} value={m.name}>{m.name} ({m.category})</option>)}
                    </select>
                 </div>
               ) : module === InventoryModule.Organ ? (
                  <>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">品类</label>
                      <select 
                        className="w-full p-2 border rounded text-sm"
                        value={newItem.category}
                        onChange={e => setNewItem({...newItem, category: e.target.value as MeatCategory})}
                      >
                         <option value={MeatCategory.Heart}>心脏</option>
                         <option value={MeatCategory.Organ}>非心脏内脏</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">名称</label>
                      <input type="text" className="w-full p-2 border rounded text-sm" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                    </div>
                  </>
               ) : (
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 mb-1">名称</label>
                    <input type="text" className="w-full p-2 border rounded text-sm" value={newItem.name || ''} onChange={e => setNewItem({...newItem, name: e.target.value, category: MeatCategory.Bone})} />
                  </div>
               )}

               <div>
                 <label className="block text-xs text-gray-500 mb-1">克数 (g)</label>
                 <input type="number" className="w-full p-2 border rounded text-sm" value={newItem.grams} onChange={e => setNewItem({...newItem, grams: Number(e.target.value)})} />
               </div>
               
               <div>
                  <label className="block text-xs text-gray-500 mb-1">入库日期</label>
                  <input type="date" className="w-full p-2 border rounded text-sm" value={newItem.inStockDate || new Date().toISOString().split('T')[0]} onChange={e => setNewItem({...newItem, inStockDate: e.target.value})} />
               </div>
             </div>
             <div className="flex justify-end gap-2">
               <button onClick={() => setIsAddMode(false)} className="px-3 py-1 text-sm text-gray-500">取消</button>
               <button onClick={saveNewItem} className="px-3 py-1 text-sm bg-primary text-white rounded">确认入库</button>
             </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
           <table className="w-full text-sm text-left">
             <thead className="bg-gray-50 text-gray-500">
               <tr>
                 <th className="px-4 py-3 w-8"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(i=>i.id) : [])} checked={selectedIds.length === filtered.length && filtered.length > 0} /></th>
                 <th className="px-4 py-3">名称</th>
                 <th className="px-4 py-3">品类</th>
                 <th className="px-4 py-3 text-right">克数</th>
                 <th className="px-4 py-3">状态</th>
                 <th className="px-4 py-3">日期信息</th>
                 <th className="px-4 py-3 text-right">操作</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filtered.map(item => (
                 <tr key={item.id} className="hover:bg-gray-50">
                   <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(item.id)} onChange={(e) => e.target.checked ? setSelectedIds([...selectedIds, item.id]) : setSelectedIds(selectedIds.filter(id => id !== item.id))} /></td>
                   <td className="px-4 py-3 font-medium">{item.name}</td>
                   <td className="px-4 py-3 text-gray-500">{item.category}</td>
                   <td className="px-4 py-3 text-right">{item.grams}</td>
                   <td className="px-4 py-3">
                     <span className={`px-2 py-0.5 rounded text-xs ${item.status === InventoryStatus.InStock ? 'bg-green-100 text-green-700' : item.status === InventoryStatus.Consuming ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                       {item.status}
                     </span>
                   </td>
                   <td className="px-4 py-3 text-xs text-gray-500">
                     <div>入库: {item.inStockDate}</div>
                     {item.startConsumeDate && <div>开始: {item.startConsumeDate}</div>}
                     {item.endConsumeDate && <div>结束: {item.endConsumeDate}</div>}
                   </td>
                   <td className="px-4 py-3 text-right">
                     <button onClick={(e) => deleteItem(item.id, e)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
                   </td>
                 </tr>
               ))}
               {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">没有找到符合条件的库存记录</td></tr>}
             </tbody>
           </table>
        </div>
      </div>
    );
  };

  // --- Records Logic ---
  const renderRecords = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
             <th className="px-4 py-3">类型</th>
             <th className="px-4 py-3">模块</th>
             <th className="px-4 py-3">时间</th>
             <th className="px-4 py-3">名称/品类</th>
             <th className="px-4 py-3">操作</th>
             <th className="px-4 py-3 text-right">克数</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
           {inboundRecords
             .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
             .map(rec => (
               <tr key={rec.id} className="hover:bg-gray-50">
                 <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${rec.type === InboundType.Direct ? 'bg-gray-100 text-gray-600' : 'bg-purple-100 text-purple-600'}`}>
                      {rec.type}
                    </span>
                 </td>
                 <td className="px-4 py-3 text-gray-600">{rec.module}</td>
                 <td className="px-4 py-3">{rec.date}</td>
                 <td className="px-4 py-3">
                   <div className="font-medium">{rec.name}</div>
                   <div className="text-xs text-gray-400">{rec.category}</div>
                 </td>
                 <td className="px-4 py-3 text-xs text-gray-500">{rec.adjustType}</td>
                 <td className="px-4 py-3 text-right font-bold text-gray-700">+{rec.grams}</td>
               </tr>
             ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Sub-Nav */}
      <div className="flex overflow-x-auto gap-2 pb-2">
        <button onClick={() => setActiveModule('summary')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeModule === 'summary' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
           库存概况
        </button>
        <button onClick={() => setActiveModule(InventoryModule.Meat)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeModule === InventoryModule.Meat ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
           肌肉肉明细
        </button>
        <button onClick={() => setActiveModule(InventoryModule.Organ)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeModule === InventoryModule.Organ ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
           内脏明细
        </button>
        <button onClick={() => setActiveModule(InventoryModule.Bone)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeModule === InventoryModule.Bone ? 'bg-stone-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
           骨骼明细
        </button>
        <div className="w-px bg-gray-300 mx-2"></div>
        <button onClick={() => setActiveModule('records')} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${activeModule === 'records' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}>
           入库记录
        </button>
      </div>

      <div key={refreshKey}>
        {activeModule === 'summary' && renderSummary()}
        {activeModule === InventoryModule.Meat && renderModuleList(InventoryModule.Meat)}
        {activeModule === InventoryModule.Organ && renderModuleList(InventoryModule.Organ)}
        {activeModule === InventoryModule.Bone && renderModuleList(InventoryModule.Bone)}
        {activeModule === 'records' && renderRecords()}
      </div>

      <ConfirmModal 
         isOpen={confirmConfig.isOpen}
         title={confirmConfig.title}
         message={confirmConfig.message}
         onConfirm={confirmConfig.action}
         onCancel={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
         isDanger={true}
       />
    </div>
  );
};

export default InventoryManager;
