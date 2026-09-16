import { ProductMapping } from '../types';

// Baza domyślna jest pusta - użytkownik buduje własną bazę mapowań
export const INITIAL_MAPPINGS: ProductMapping[] = [];

export const STORAGE_KEY_MAPPINGS = 'excel_gs_mappings_v1';
export const STORAGE_KEY_CONFIG = 'excel_gs_sheets_config_v1';

// STAŁY ADRES WEBHOOKA DLA WSZYSTKICH UŻYTKOWNIKÓW:
export const GLOBAL_DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbybDRglKBsdRXykR5swck7yd7jGfP6NZogkfBrWpu0Ud4YBIUebu1WMMh8w7r5oGPTs/exec';

