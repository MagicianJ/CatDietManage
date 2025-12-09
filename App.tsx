
import React, { useState, useEffect } from 'react';
import { Cat, MeatType, InventoryItem, PurchaseItem, InboundRecord, InventoryStatus, InboundType, InventoryModule } from './types';
import { INITIAL_CAT, DEFAULT_MEATS, generateId } from './constants';
import CatManager from './components/CatManager';
import MeatManager from './components/MeatManager';
import DietCalculator from './components/DietCalculator';
import PackagingPlan from './components/PackagingPlan';
import InventoryManager from './components/InventoryManager';
import PurchaseManager from './components/PurchaseManager';
import { LayoutDashboard, Cat as CatIcon, Beef, Settings, ClipboardList, Package, ShoppingCart } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [cats, setCats] = useState<Cat[]>(() => {
    const saved = localStorage.getItem('rawpaws_cats');
    return saved ? JSON.parse(saved) : [];
  });

  const [meats, setMeats] = useState<MeatType[]>(() => {
    const saved = localStorage.getItem('rawpaws_meats');
    return saved ? JSON.parse(saved) : DEFAULT_MEATS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('rawpaws_inventory');
    return saved ? JSON.parse(saved) : [];
  });

  const [purchases, setPurchases] = useState<PurchaseItem[]>(() => {
    const saved = localStorage.getItem('rawpaws_purchases');
    return saved ? JSON.parse(saved) : [];
  });

  const [inboundRecords, setInboundRecords] = useState<InboundRecord[]>(() => {
    const saved = localStorage.getItem('rawpaws_inbound');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'meats' | 'inventory' | 'purchase' | 'cat-detail'>('dashboard');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => { localStorage.setItem('rawpaws_cats', JSON.stringify(cats)); }, [cats]);
  useEffect(() => { localStorage.setItem('rawpaws_meats', JSON.stringify(meats)); }, [meats]);
  useEffect(() => { localStorage.setItem('rawpaws_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('rawpaws_purchases', JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem('rawpaws_inbound', JSON.stringify(inboundRecords)); }, [inboundRecords]);

  // --- Handlers ---
  const handleSelectCat = (id: string) => {
    setSelectedCatId(id);
    setActiveView('cat-detail');
  };

  const handleUpdateCat = (updatedCat: Cat) => {
    setCats(cats.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleConfirmArrival = (items: PurchaseItem[]) => {
    const newInventoryItems: InventoryItem[] = [];
    const newRecords: InboundRecord[] = [];
    const now = new Date().toISOString().split('T')[0];

    items.forEach(p => {
      // Add to inventory
      newInventoryItems.push({
        id: generateId(),
        module: p.module,
        category: p.category,
        name: p.name,
        grams: p.grams,
        status: InventoryStatus.InStock,
        inStockDate: now
      });

      // Add to record
      newRecords.push({
        id: generateId(),
        type: InboundType.Purchase,
        module: p.module,
        category: p.category,
        name: p.name,
        grams: p.grams,
        date: now,
        adjustType: '新增'
      });
    });

    setInventory([...inventory, ...newInventoryItems]);
    setInboundRecords([...newRecords, ...inboundRecords]);
  };

  const selectedCat = cats.find(c => c.id === selectedCatId);

  // --- Navigation Items ---
  const navItems = [
    { id: 'dashboard', label: '面板', icon: LayoutDashboard },
    { id: 'meats', label: '肌肉肉', icon: Beef },
    { id: 'inventory', label: '库存', icon: Package },
    { id: 'purchase', label: '采购', icon: ShoppingCart },
  ];

  // --- Render ---
  return (
    <div className="h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900 overflow-hidden">
      
      {/* --- Mobile Top Header --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
          <h1 className="text-lg font-bold text-gray-800">RawPaws</h1>
        </div>
        {activeView === 'cat-detail' && selectedCat && (
          <div className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
            <CatIcon size={14} /> {selectedCat.name}
          </div>
        )}
      </header>

      {/* --- Desktop Sidebar Navigation --- */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col h-full z-10 shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">RawPaws</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === item.id ? 'bg-rose-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <item.icon size={20} />
              {item.id === 'dashboard' ? '主面板' : item.id === 'meats' ? '肌肉肉管理' : item.id === 'inventory' ? '食物库存管理' : '采购计划管理'}
            </button>
          ))}

          {selectedCatId && (
            <div className="mt-8 animate-fade-in">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                当前选择
              </div>
              <button
                onClick={() => setActiveView('cat-detail')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'cat-detail' ? 'bg-teal-50 text-secondary' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <CatIcon size={20} />
                {selectedCat ? selectedCat.name : 'Unknown'}
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100 text-xs text-gray-400 text-center">
          生骨肉饮食管理 v2.0
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 h-full overflow-y-auto bg-gray-50 scroll-smooth">
        <div className="p-4 md:p-8 pt-20 pb-24 md:pt-8 md:pb-8 max-w-5xl mx-auto">
          
          {activeView === 'dashboard' && (
            <div className="space-y-6">
               <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">猫猫档案</h1>
                <p className="text-gray-500">管理您的猫猫及其专属饮食计划。</p>
               </div>
               <CatManager 
                 cats={cats} 
                 setCats={setCats} 
                 onSelectCat={handleSelectCat} 
               />
            </div>
          )}

          {activeView === 'meats' && (
             <MeatManager meats={meats} setMeats={setMeats} />
          )}

          {activeView === 'inventory' && (
             <div className="space-y-6">
               {/* Mobile Title (Optional duplicate since header exists, but good for context) */}
               <div className="mb-6 hidden md:block">
                 <h1 className="text-2xl font-bold text-gray-800">食物库存管理</h1>
                 <p className="text-gray-500">监控全家库存状态，管理入库与消耗。</p>
               </div>
               <InventoryManager 
                 inventory={inventory}
                 setInventory={setInventory}
                 inboundRecords={inboundRecords}
                 setInboundRecords={setInboundRecords}
                 cats={cats}
                 meats={meats}
               />
             </div>
          )}

          {activeView === 'purchase' && (
             <div className="space-y-6">
               <div className="mb-6 hidden md:block">
                 <h1 className="text-2xl font-bold text-gray-800">采购计划管理</h1>
                 <p className="text-gray-500">规划未来的采购并处理到货。</p>
               </div>
               <PurchaseManager 
                 purchases={purchases}
                 setPurchases={setPurchases}
                 cats={cats}
                 meats={meats}
                 onConfirmArrival={handleConfirmArrival}
               />
             </div>
          )}

          {activeView === 'cat-detail' && selectedCat && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                   <button 
                     onClick={() => setActiveView('dashboard')} 
                     className="text-sm text-gray-500 hover:text-primary mb-1 inline-flex items-center gap-1"
                   >
                     &larr; 返回主面板
                   </button>
                   <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
                     {selectedCat.name} 的饮食计划
                     <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                       体重: {selectedCat.weight}g
                     </span>
                   </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-gray-400" />
                    参数配置
                  </h2>
                  <DietCalculator cat={selectedCat} updateCat={handleUpdateCat} />
                </section>
                
                <section>
                   <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <ClipboardList size={20} className="text-gray-400" />
                    分装与备餐
                  </h2>
                  <PackagingPlan cat={selectedCat} />
                </section>
              </div>
            </div>
          )}
          
          {activeView === 'cat-detail' && !selectedCat && (
            <div className="text-center py-20">
              <p>找不到该猫猫信息，请返回主面板。</p>
            </div>
          )}
        </div>
      </main>

      {/* --- Mobile Bottom Navigation --- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-30 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as any)}
            className={`flex flex-col items-center justify-center w-full h-full ${
              activeView === item.id || (item.id === 'dashboard' && activeView === 'cat-detail') 
                ? 'text-primary' 
                : 'text-gray-400'
            }`}
          >
            <item.icon size={24} strokeWidth={activeView === item.id ? 2.5 : 2} />
            <span className="text-[10px] mt-1 font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

    </div>
  );
};

export default App;
