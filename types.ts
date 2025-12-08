
export enum Gender {
  Male = '公',
  Female = '母',
}

export enum MeatCategory {
  Red = '红肉',
  White = '白肉',
}

export interface MeatType {
  id: string;
  name: string;
  category: MeatCategory;
  isSystem?: boolean; 
}

export interface DietRatios {
  dailyIntakePercent: number; // % of body weight
  redMeatPercent: number;
  whiteMeatPercent: number;
  heartPercent: number;
  organPercent: number; // Non-heart organ
  bonePercent: number;
}

export interface Cat {
  id: string;
  name: string;
  birthDate: string; // YYYY-MM-DD
  gender: Gender;
  isNeutered: boolean;
  weight: number; // in grams
  breed: string;
  image?: string;
  
  dietRatios: DietRatios;
  // Supplements are now calculated via fixed rules, no longer stored per cat
}
