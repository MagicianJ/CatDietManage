
import { Cat, DietRatios, MeatCategory, MeatType, Gender } from './types';

export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const DEFAULT_MEATS: MeatType[] = [
  { id: 'm1', name: '牛肉', category: MeatCategory.Red, isSystem: true },
  { id: 'm2', name: '猪肉', category: MeatCategory.Red, isSystem: true },
  { id: 'm3', name: '羊肉', category: MeatCategory.Red, isSystem: true },
  { id: 'm4', name: '兔肉(红)', category: MeatCategory.Red, isSystem: true },
  { id: 'm5', name: '鸡肉', category: MeatCategory.White, isSystem: true },
  { id: 'm6', name: '鸭肉', category: MeatCategory.White, isSystem: true },
  { id: 'm7', name: '鹅肉', category: MeatCategory.White, isSystem: true },
  { id: 'm8', name: '兔肉(白)', category: MeatCategory.White, isSystem: true },
  { id: 'm9', name: '鹌鹑', category: MeatCategory.White, isSystem: true },
  { id: 'm10', name: '鸵鸟肉', category: MeatCategory.White, isSystem: true },
  { id: 'm11', name: '火鸡肉', category: MeatCategory.White, isSystem: true },
];

export const DEFAULT_DIET_RATIOS: DietRatios = {
  dailyIntakePercent: 3, 
  redMeatPercent: 40,
  whiteMeatPercent: 40,
  heartPercent: 5, 
  organPercent: 5,
  bonePercent: 10,
};

export const INITIAL_CAT: Cat = {
  id: '',
  name: '',
  birthDate: new Date().toISOString().split('T')[0],
  gender: Gender.Male,
  isNeutered: true,
  weight: 4000,
  breed: '中华田园猫',
  dietRatios: { ...DEFAULT_DIET_RATIOS }
};

export const getLifeStage = (birthDate: string): 'kitten' | 'adult' => {
  const today = new Date();
  const birth = new Date(birthDate);
  const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  // If exact day is earlier in the month, month diff might be off by one? 
  // Simplified logic: strict month difference. 
  // If birth is 2023-01-01 and today is 2024-01-01, diff is 12 -> Adult.
  // We can refine day check:
  let m = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
  if (today.getDate() < birth.getDate()) {
      m--;
  }
  return m < 12 ? 'kitten' : 'adult';
};

export const getAgeLabel = (birthDate: string): string => {
  const stage = getLifeStage(birthDate);
  return stage === 'adult' ? '成猫' : '幼猫';
};
