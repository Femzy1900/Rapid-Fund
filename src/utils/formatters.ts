
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateDaysLeft = (expiresAt: string) => {
  const expiry = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const diff = expiry - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
