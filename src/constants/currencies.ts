export const CURRENCIES = ['USD', 'KHR', 'EUR', 'THB', 'VND', 'SGD', 'GBP', 'JPY'];

const NAMES: Record<string, string> = {
  USD: 'US dollar',
  KHR: 'Cambodian riel',
  EUR: 'Euro',
  THB: 'Thai baht',
  VND: 'Vietnamese dong',
  SGD: 'Singapore dollar',
  GBP: 'British pound',
  JPY: 'Japanese yen',
};

/** Options for the currency <Select> */
export const CURRENCY_OPTIONS = CURRENCIES.map((c) => ({ value: c, label: `${c} — ${NAMES[c]}` }));
