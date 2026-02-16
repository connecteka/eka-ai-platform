import axios from "axios"

// Get base URL and ensure /api prefix
const getBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || ""
  if (baseUrl && !baseUrl.endsWith("/api")) {
    return `${baseUrl}/api`
  }
  return baseUrl || "/api"
}

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (data: {
    email: string
    password: string
    name: string
    workshop_name?: string
  }) => api.post("/api/auth/register", data),
  googleLogin: (access_token: string) =>
    api.post("/api/auth/google", { access_token }),
  me: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
}

export const dashboardApi = {
  getMetrics: () => api.get("/api/dashboard/metrics"),
}

export const jobCardsApi = {
  getAll: (params?: { status?: string; limit?: number; offset?: number }) =>
    api.get("/api/job-cards", { params }),
  getById: (id: string) => api.get(`/api/job-cards/${id}`),
  create: (data: any) => api.post("/api/job-cards", data),
  update: (id: string, data: any) => api.put(`/api/job-cards/${id}`, data),
  delete: (id: string) => api.delete(`/api/job-cards/${id}`),
  transition: (id: string, data: { new_status: string; notes?: string }) =>
    api.post(`/api/job-cards/${id}/transition`, data),
  getStats: () => api.get("/api/job-cards/stats/overview"),
}

export const invoicesApi = {
  getAll: (params?: { status?: string; limit?: number }) =>
    api.get("/api/invoices", { params }),
  getById: (id: string) => api.get(`/api/invoices/${id}`),
  create: (data: any) => api.post("/api/invoices", data),
  finalize: (id: string) => api.post(`/api/invoices/${id}/finalize`),
  generatePdf: (id: string) => api.post(`/api/invoices/${id}/pdf`),
}

export const chatApi = {
  send: (data: any) => api.post("/api/chat", data),
  stream: (data: any) => api.post("/api/chat/stream", data),
  getSessions: () => api.get("/api/chat/sessions"),
  createSession: (data?: { title?: string }) =>
    api.post("/api/chat/sessions", data),
}

export const mgFleetApi = {
  getContracts: (params?: { status?: string }) =>
    api.get("/api/mg/contracts", { params }),
  createContract: (data: any) => api.post("/api/mg/contracts", data),
  getReport: (contractId: string) =>
    api.get(`/api/mg/reports/${contractId}`),
}
