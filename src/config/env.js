const apiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:3001';

export const env = {
  apiUrl,
  checkoutSessionUrl: `${apiUrl}/api/create-checkout-session`,
};
