
export enum Gender {
  Male = '公',
  Female = '母',
}

export enum MeatCategory {
  Red = '红肉',
  White = '白肉',
  Heart = '心脏',
  Organ = '非心脏内脏',
  Bone = '骨骼',
}

export enum InventoryStatus {
  InStock = '已入库',
  Consuming = '消耗中',
  Consumed = '已消耗',
}

export enum InventoryModule {
  Meat = '肌肉肉',
  Organ = '内脏',
  Bone = '骨骼',
}

export enum InboundType {
  Direct = '库存直调',
  Purchase = '采购计划入库',
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
}

export interface InventoryItem {
  id: string;
  module: InventoryModule;
  category: MeatCategory;
  name: string;
  grams: number;
  status: InventoryStatus;
  inStockDate: string; // YYYY-MM-DD
  startConsumeDate?: string;
  endConsumeDate?: string;
}

export interface InboundRecord {
  id: string;
  type: InboundType;
  module: InventoryModule;
  category: MeatCategory;
  name: string;
  grams: number;
  date: string;
  adjustType: '新增' | '修改'; // Simple tracking
}

export interface PurchaseItem {
  id: string;
  module: InventoryModule;
  category: MeatCategory;
  name: string;
  grams: number;
  expectedDate: string;
}
