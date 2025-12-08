import React, { useState, useEffect } from 'react';
import { Cat, MeatType } from './types';
import { INITIAL_CAT, DEFAULT_MEATS } from './constants';
import CatManager from './components/CatManager';
import MeatManager from './components/MeatManager';
import DietCalculator from './components/DietCalculator';
import PackagingPlan from './components/PackagingPlan';
import { LayoutDashboard, Cat as CatIcon, Beef, Settings, ClipboardList } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  // Load from local storage or defaults
  const [cats, setCats] = useState<Cat[]>(() => {
    const saved = localStorage.getItem('rawpaws_cats');
    return saved ? JSON.parse(saved) : [];
  });

  const [meats, setMeats] = useState<MeatType[]>(() => {
    const saved = localStorage.getItem('rawpaws_meats');
    return saved ? JSON.parse(saved) : DEFAULT_MEATS;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'meats' | 'cat-detail'>('dashboard');
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('rawpaws_cats', JSON.stringify(cats));
  }, [cats]);

  useEffect(() => {
    localStorage.setItem('rawpaws_meats', JSON.stringify(meats));
  }, [meats]);

  // --- Handlers ---
  const handleSelectCat = (id: string) => {
    setSelectedCatId(id);
    setActiveView('cat-detail');
  };

  const handleUpdateCat = (updatedCat: Cat) => {
    setCats(cats.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const selectedCat = cats.find(c => c.id === selectedCatId);

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-900">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col sticky top-0 md:h-screen z-10 shadow-sm md:shadow-none">
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">R</div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">RawPaws</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'dashboard' ? 'bg-rose-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard & Cats
          </button>
          
          <button
            onClick={() => setActiveView('meats')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeView === 'meats' ? 'bg-rose-50 text-primary' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <Beef size={20} />
            Meat Database
          </button>

          {selectedCatId && (
            <div className="mt-8">
              <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Active Cat
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
          v1.0.0 &bull; Local Storage
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          
          {activeView === 'dashboard' && (
            <div className="space-y-6">
               <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Pet Profiles</h1>
                <p className="text-gray-500">Manage your cats and access their diet plans.</p>
               </div>
               <CatManager 
                 cats={cats} 
                 setCats={setCats} 
                 onSelectCat={handleSelectCat} 
               />
            </div>
          )}

          {activeView === 'meats' && (
             <div className="space-y-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Meat Database</h1>
                <p className="text-gray-500">Define available ingredients for red and white meat categories.</p>
              </div>
              <MeatManager meats={meats} setMeats={setMeats} />
            </div>
          )}

          {activeView === 'cat-detail' && selectedCat && (
            <div className="space-y-8 fade-in">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                   <button 
                     onClick={() => setActiveView('dashboard')} 
                     className="text-sm text-gray-500 hover:text-primary mb-1 inline-flex items-center gap-1"
                   >
                     &larr; Back to Dashboard
                   </button>
                   <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                     {selectedCat.name}'s Meal Plan
                     <span className="text-sm font-normal bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                       {selectedCat.weight}g Body Weight
                     </span>
                   </h1>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <section>
                  <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-gray-400" />
                    Configuration
                  </h2>
                  <DietCalculator cat={selectedCat} updateCat={handleUpdateCat} />
                </section>
                
                <section>
                   <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                    <ClipboardList size={20} className="text-gray-400" />
                    Packaging & Prep
                  </h2>
                  <PackagingPlan cat={selectedCat} />
                </section>
              </div>
            </div>
          )}
          
          {activeView === 'cat-detail' && !selectedCat && (
            <div className="text-center py-20">
              <p>Cat not found. Please return to dashboard.</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
