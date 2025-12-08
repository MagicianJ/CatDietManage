export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum MeatCategory {
  Red = 'Red Meat',
  White = 'White Meat',
}

export enum SupplementUnit {
  Gram = 'g',
  Pill = 'pill',
  Drop = 'drop',
  Pump = 'pump'
}

export enum SupplementMethod {
  FixedDaily = 'Fixed Amount Per Day',
  ByFoodRatio = 'Percentage of Daily Food Weight', // e.g., 1% of total food intake
}

export interface MeatType {
  id: string;
  name: string;
  category: MeatCategory;
  isSystem?: boolean; // Default ones that shouldn't be deleted easily
}

export interface DietRatios {
  dailyIntakePercent: number; // % of body weight (e.g. 3%)
  redMeatPercent: number;
  whiteMeatPercent: number;
  heartPercent: number;
  organPercent: number; // Non-heart organ
  bonePercent: number;
}

export interface Supplement {
  id: string;
  name: string;
  unit: SupplementUnit;
  method: SupplementMethod;
  value: number; // The amount or the percentage
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
  
  // Each cat has its own diet settings
  dietRatios: DietRatios;
  supplements: Supplement[];
}
