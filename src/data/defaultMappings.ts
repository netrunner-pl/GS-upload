import { ProductMapping } from '../types';

export const INITIAL_MAPPINGS: ProductMapping[] = [
  { code: 'SAM-S24-128', brand: 'Samsung', model: 'Galaxy S24 128GB' },
  { code: 'SAM-S24U-256', brand: 'Samsung', model: 'Galaxy S24 Ultra 256GB' },
  { code: 'APL-IP16-128', brand: 'Apple', model: 'iPhone 16 128GB' },
  { code: 'APL-IP16P-256', brand: 'Apple', model: 'iPhone 16 Pro 256GB' },
  { code: 'XIA-RN13-8', brand: 'Xiaomi', model: 'Redmi Note 13 Pro 8/256' },
  { code: 'XIA-14T-12', brand: 'Xiaomi', model: 'Xiaomi 14T 12/512' },
  { code: 'SNY-WH1000-B', brand: 'Sony', model: 'WH-1000XM5 Black' },
  { code: 'ASU-ZEPH-G16', brand: 'Asus', model: 'ROG Zephyrus G16' },
  { code: 'LEN-LOQ-15', brand: 'Lenovo', model: 'LOQ 15 Gaming' },
  { code: 'LG-OLED-55C4', brand: 'LG', model: 'OLED evo 55C4' },
];

export const STORAGE_KEY_MAPPINGS = 'excel_gs_mappings_v1';
export const STORAGE_KEY_CONFIG = 'excel_gs_sheets_config_v1';
