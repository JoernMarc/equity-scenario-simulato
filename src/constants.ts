import { AntiDilutionProtection, LiquidationPreferenceType } from "./types";

export const LEGAL_FORMS = [
  { value: 'GmbH', label: 'GmbH', country: 'DE' },
  { value: 'UG (haftungsbeschränkt)', label: 'UG (haftungsbeschränkt)', country: 'DE' },
  { value: 'AG', label: 'AG', country: 'DE' },
  { value: 'GmbH & Co. KG', label: 'GmbH & Co. KG', country: 'DE' },
  { value: 'KGaA', label: 'KGaA', country: 'DE' },
  { value: 'C-Corp', label: 'C-Corporation', country: 'US' },
  { value: 'LLC', label: 'LLC', country: 'US' },
  { value: 'Ltd', label: 'Limited Company', country: 'UK' },
];

export const COMMON_CURRENCIES = ['EUR', 'USD', 'CHF', 'GBP'];


export const LIQUIDATION_PREFERENCE_TYPES: LiquidationPreferenceType[] = ['NON_PARTICIPATING', 'FULL_PARTICIPATING', 'CAPPED_PARTICIPATING'];
export const ANTI_DILUTION_TYPES: AntiDilutionProtection[] = ['NONE', 'BROAD_BASED', 'NARROW_BASED', 'FULL_RATCHET'];

export const LEGAL_FORM_REQUIREMENTS: Record<string, { requiredCapital?: number; currency: string }> = {
    'GmbH': { requiredCapital: 25000, currency: 'EUR' },
    'UG (haftungsbeschränkt)': { requiredCapital: 1, currency: 'EUR' },
    'AG': { requiredCapital: 50000, currency: 'EUR' },
    'KGaA': { requiredCapital: 50000, currency: 'EUR' },
};