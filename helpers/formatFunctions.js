// formatFunctions.js

export function formatCurrency(value) {
  return (
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(value) || "$0.00"
  );
}

export function revertCurrencyToNumber(formattedValue) {
  return formattedValue
    ? parseFloat(formattedValue.replace(/[^\d.-]/g, ""))
    : 0;
}

// Method to format as currency
export const formatCurrencyValidated = (value) => {
  if (!value) return '';
  const number = typeof value === 'number' ? value : parseFloat(value.toString().replace(/,/g, ''));
  return number.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

// Method to parse formatted currency back to a raw number
export const parseCurrency = (value) => {
  if (!value) return '';
  return parseFloat(value.toString().replace(/,/g, '').replace(/\./g, '')) / 100;
};

