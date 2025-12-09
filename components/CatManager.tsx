
import React, { useState } from 'react';
import { Cat, Gender } from '../types';
import { generateId, INITIAL_CAT, getAgeLabel } from '../constants';
import { Plus, Trash2, Edit2, Scale, Calendar, Cat as CatIcon } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

interface CatManagerProps {
  cats: Cat[];
  setCats: (cats: Cat[] | ((prev: Cat[]) => Cat[])) => void;
  onSelectCat: (catId: string) => void;
}

const CatManager: React.FC<CatManagerProps> = ({ cats, setCats, onSelectCat }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Cat>(INITIAL_CAT);
  const [isEditing, setIsEditing] = useState(false);

  // Modal State
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    action: () => void;
  }>({ isOpen: false, title: '', message: '', action: () => {} });

  const calculateAge = (birthDate: string): string => {
    const today = new Date();
    const birth = new Date(birthDate);
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      years--;
      months += 12;
    }
    return `${years}岁 ${months}个月`;
  };

  const handleOpenModal = (cat?: Cat) => {
    if (cat) {
      setFormData(cat);
      setIsEditing(true);
    } else {
      setFormData({ ...INITIAL_CAT, id: generateId() });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (isEditing) {
      setCats(prev => prev.map(c => c.id === formData.id ? formData : c));
    } else {
      setCats(prev => [...prev, formData]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault(); 
    setConfirmConfig({
      isOpen: true,
      title: '删除猫猫档案',
      message: '确定要删除这只猫猫的档案吗？此操作无法撤销。',
      action: () => {
        setCats(prev => prev.filter(c => c.id !== id));
      }
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">猫猫管理</h2>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-rose-600 transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> 添加猫猫
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cats.map(cat => (
          <div
            key={cat.id}
            onClick={() => onSelectCat(cat.id)}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
              <button 
                onClick={(e) => { e.stopPropagation(); handleOpenModal(cat); }}
                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => handleDelete(cat.id, e)}
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <CatIcon size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  {cat.name}
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getAgeLabel(cat.birthDate) === '成猫' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {getAgeLabel(cat.birthDate)}
                  </span>
                </h3>
                <p className="text-sm text-gray-500">{cat.breed}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-secondary" />
                <span>{cat.weight}g</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-secondary" />
                <span>{calculateAge(cat.birthDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.gender === Gender.Male ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                  {cat.gender}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${cat.isNeutered ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {cat.isNeutered ? '已绝育' : '未绝育'}
                </span>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <span className="text-primary font-semibold text-sm">管理饮食计划 &rarr;</span>
            </div>
          </div>
        ))}
      </div>

      {cats.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">暂无猫猫信息</p>
          <button onClick={() => handleOpenModal()} className="text-primary font-semibold hover:underline">添加第一只猫猫</button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-6">{isEditing ? '编辑猫猫' : '添加新猫猫'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">出生日期</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">体重 (g)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={e => setFormData({ ...formData, weight: Number(e.target.value) })}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">性别</label>
                  <select
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-full p-2 border rounded-lg"
                  >
                    <option value={Gender.Male}>公</option>
                    <option value={Gender.Female}>母</option>
                  </select>
                </div>
                 <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id="neutered"
                      checked={formData.isNeutered}
                      onChange={e => setFormData({ ...formData, isNeutered: e.target.checked })}
                      className="w-5 h-5 text-primary rounded"
                    />
                    <label htmlFor="neutered" className="text-sm">是否已绝育</label>
                  </div>
                </div>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">品种</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={e => setFormData({ ...formData, breed: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">取消</button>
              <button onClick={handleSave} className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-rose-600">保存</button>
            </div>
          </div>
        </div>
      )}

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

export default CatManager;
