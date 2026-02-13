const API_URL = import.meta.env.VITE_API_URL || '';

class APIService {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  async login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string, name: string, workshopName?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name, workshop_name: workshopName }),
    });
  }

  async chat(message: string, sessionId?: string) {
    return this.request('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  }

  async getJobCards(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/job-cards${params}`);
  }

  async getJobCard(id: string) {
    return this.request(`/api/job-cards/${id}`);
  }

  async createJobCard(data: any) {
    return this.request('/api/job-cards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateJobCard(id: string, data: any) {
    return this.request(`/api/job-cards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteJobCard(id: string) {
    return this.request(`/api/job-cards/${id}`, {
      method: 'DELETE',
    });
  }

  async transitionJobCard(id: string, newStatus: string, notes?: string) {
    return this.request(`/api/job-cards/${id}/transition`, {
      method: 'POST',
      body: JSON.stringify({ new_status: newStatus, notes }),
    });
  }

  async getJobCardStats() {
    return this.request('/api/job-cards/stats/overview');
  }

  async getInvoices(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/invoices${params}`);
  }

  async createInvoice(data: any) {
    return this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async finalizeInvoice(id: string) {
    return this.request(`/api/invoices/${id}/finalize`, {
      method: 'POST',
    });
  }

  async getMGContracts(status?: string) {
    const params = status ? `?status=${status}` : '';
    return this.request(`/api/mg/contracts${params}`);
  }

  async createMGContract(data: any) {
    return this.request('/api/mg/contracts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMGReport(contractId: string) {
    return this.request(`/api/mg/reports/${contractId}`);
  }

  async getDashboardMetrics() {
    return this.request('/api/dashboard/metrics');
  }

  async healthCheck() {
    return this.request('/api/health');
  }
}

export const apiService = new APIService();
