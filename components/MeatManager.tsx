import React, { useState } from 'react';
import { MeatType, MeatCategory } from '../types';
import { generateId } from '../constants';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';

interface MeatManagerProps {
  meats: MeatType[];
  setMeats: (meats: MeatType[]) => void;
}

const MeatManager: React.FC<MeatManagerProps> = ({ meats, setMeats }) => {
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<MeatCategory>(MeatCategory.Red);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState<MeatCategory>(MeatCategory.Red);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newMeat: MeatType = {
      id: generateId(),
      name: newName,
      category: newCategory,
      isSystem: false,
    };
    setMeats([...meats, newMeat]);
    setNewName('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this meat type?')) {
      setMeats(meats.filter((m) => m.id !== id));
    }
  };

  const startEdit = (meat: MeatType) => {
    setEditingId(meat.id);
    setEditName(meat.name);
    setEditCategory(meat.category);
  };

  const saveEdit = () => {
    if (!editName.trim()) return;
    setMeats(meats.map(m => m.id === editingId ? { ...m, name: editName, category: editCategory } : m));
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const redMeats = meats.filter(m => m.category === MeatCategory.Red);
  const whiteMeats = meats.filter(m => m.category === MeatCategory.White);

  const renderList = (title: string, items: MeatType[], colorClass: string) => (
    <div className={`p-4 rounded-xl border ${colorClass} bg-white shadow-sm flex-1`}>
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className={`w-3 h-3 rounded-full ${title === 'Red Meat' ? 'bg-red-500' : 'bg-orange-300'}`}></span>
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((meat) => (
          <li key={meat.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md group hover:bg-gray-100 transition-colors">
            {editingId === meat.id ? (
              <div className="flex items-center gap-2 w-full">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 p-1 border rounded text-sm"
                />
                <button onClick={saveEdit} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check size={16} /></button>
                <button onClick={cancelEdit} className="text-gray-500 hover:bg-gray-200 p-1 rounded"><X size={16} /></button>
              </div>
            ) : (
              <>
                <span className="font-medium text-gray-700">{meat.name}</span>
                <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(meat)} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(meat.id)} className="text-red-500 hover:bg-red-100 p-1.5 rounded"><Trash2 size={14} /></button>
                </div>
              </>
            )}
          </li>
        ))}
        {items.length === 0 && <li className="text-gray-400 text-sm italic">No meats added.</li>}
      </ul>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Meat Type</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-600 mb-1">Meat Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Venison"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div className="w-full sm:w-48">
             <label className="block text-sm font-medium text-gray-600 mb-1">Category</label>
             <select
               value={newCategory}
               onChange={(e) => setNewCategory(e.target.value as MeatCategory)}
               className="w-full p-2 border border-gray-300 rounded-lg outline-none"
             >
               <option value={MeatCategory.Red}>Red Meat</option>
               <option value={MeatCategory.White}>White Meat</option>
             </select>
          </div>
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {renderList('Red Meat', redMeats, 'border-red-100')}
        {renderList('White Meat', whiteMeats, 'border-orange-100')}
      </div>
    </div>
  );
};

export default MeatManager;
