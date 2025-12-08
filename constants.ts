import { Cat, DietRatios, MeatCategory, MeatType, Gender, SupplementUnit, SupplementMethod } from './types';
import { v4 as uuidv4 } from 'uuid'; // We'll assume a utility or just mock uuid for now since we can't install packages.

// Helper for ID generation if UUID isn't available in this environment, 
// strictly speaking we should use a library but for this output we use a simple random string.
export const generateId = (): string => Math.random().toString(36).substring(2, 9);

export const DEFAULT_MEATS: MeatType[] = [
  { id: 'm1', name: 'Beef', category: MeatCategory.Red, isSystem: true },
  { id: 'm2', name: 'Pork', category: MeatCategory.Red, isSystem: true },
  { id: 'm3', name: 'Lamb', category: MeatCategory.Red, isSystem: true },
  { id: 'm4', name: 'Rabbit (Red)', category: MeatCategory.Red, isSystem: true },
  { id: 'm5', name: 'Chicken', category: MeatCategory.White, isSystem: true },
  { id: 'm6', name: 'Duck', category: MeatCategory.White, isSystem: true },
  { id: 'm7', name: 'Goose', category: MeatCategory.White, isSystem: true },
  { id: 'm8', name: 'Rabbit (White)', category: MeatCategory.White, isSystem: true },
  { id: 'm9', name: 'Quail', category: MeatCategory.White, isSystem: true },
  { id: 'm10', name: 'Ostrich', category: MeatCategory.White, isSystem: true },
  { id: 'm11', name: 'Turkey', category: MeatCategory.White, isSystem: true },
];

// Default Frankenprey Ratio: 80% Meat (split 40/40), 10% Bone, 5% Liver, 5% Other Organ
export const DEFAULT_DIET_RATIOS: DietRatios = {
  dailyIntakePercent: 3, // 3% of body weight is standard for adult cats
  redMeatPercent: 40,
  whiteMeatPercent: 40,
  heartPercent: 5, // Heart is muscle meat but often tracked separately or as part of Red. 
                   // Based on prompt "Muscle meat (Red/White), Organs (Heart/Non-Heart), Bone". 
                   // We will assume Heart counts towards the muscle meat category in some models, 
                   // but here the prompt asks for "Red, White, Heart, Non-Heart, Bone" editing.
                   // So we treat them as 5 distinct buckets summing to 100%.
  organPercent: 5,
  bonePercent: 10,
};

// Initial state for a new cat
export const INITIAL_CAT: Cat = {
  id: '',
  name: '',
  birthDate: new Date().toISOString().split('T')[0],
  gender: Gender.Male,
  isNeutered: true,
  weight: 4000,
  breed: 'Domestic Shorthair',
  dietRatios: { ...DEFAULT_DIET_RATIOS },
  supplements: []
};
