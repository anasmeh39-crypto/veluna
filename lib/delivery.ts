// Morocco delivery fee configuration.
// Edit CITY_FEES and FREE_DELIVERY_THRESHOLD to change delivery pricing.

export const FREE_DELIVERY_THRESHOLD = 299 // MAD — orders above this ship free

// Fees by city (Arabic names). Unknown cities fall back to DEFAULT_FEE.
const CITY_FEES: Record<string, number> = {
  'الدار البيضاء': 20,
  'سلا': 20,
  'تمارة': 20,
  'الرباط': 25,
  'مراكش': 25,
  'فاس': 25,
  'طنجة': 25,
  'أكادير': 25,
  'مكناس': 25,
  'القنيطرة': 25,
  'وجدة': 30,
  'تطوان': 30,
  'الجديدة': 30,
  'آسفي': 30,
  'بني ملال': 30,
  'خريبكة': 30,
  'الناظور': 30,
  'العرائش': 30,
  'القصر الكبير': 30,
  'سطات': 30,
  'برشيد': 30,
  'المحمدية': 25,
  'بركان': 35,
  'تزنيت': 35,
  'طاطا': 35,
  'ورزازات': 40,
  'الراشيدية': 40,
  'إفران': 35,
  'العيون': 45,
  'الداخلة': 50,
  'السمارة': 50,
}

const DEFAULT_FEE = 35

export function getDeliveryFee(city: string, subtotal: number): number {
  if (subtotal >= FREE_DELIVERY_THRESHOLD) return 0
  return CITY_FEES[city.trim()] ?? DEFAULT_FEE
}

export function getCitiesList(): string[] {
  return Object.keys(CITY_FEES).sort()
}

export const MOROCCAN_CITIES = getCitiesList()
