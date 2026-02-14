// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://named-dialect-486912-c7.el.r.appspot.com';

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/api/health`,
  jobCards: `${API_BASE_URL}/api/job-cards`,
  invoices: `${API_BASE_URL}/api/invoices`,
  payments: `${API_BASE_URL}/api/payments`,
  mgContracts: `${API_BASE_URL}/api/mg/contracts`,
  mgVehicleLogs: `${API_BASE_URL}/api/mg/vehicle-logs`,
};
