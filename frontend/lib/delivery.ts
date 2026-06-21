// Delivery is always free — no fees charged on any order.

const MOROCCAN_CITIES_LIST = [
  'الدار البيضاء', 'سلا', 'تمارة', 'الرباط', 'مراكش', 'فاس', 'طنجة',
  'أكادير', 'مكناس', 'القنيطرة', 'المحمدية', 'وجدة', 'تطوان',
  'الجديدة', 'آسفي', 'بني ملال', 'خريبكة', 'الناظور', 'العرائش',
  'القصر الكبير', 'سطات', 'برشيد', 'بركان', 'تزنيت', 'طاطا', 'إفران',
  'ورزازات', 'الراشيدية', 'العيون', 'الداخلة', 'السمارة',
]

export function getDeliveryFee(_city: string, _subtotal: number): number {
  return 0
}

export function getCitiesList(): string[] {
  return MOROCCAN_CITIES_LIST.slice().sort()
}

export const MOROCCAN_CITIES = getCitiesList()
export const FREE_DELIVERY_THRESHOLD = 0
