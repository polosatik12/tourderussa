// API Configuration for Tour de Russie Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(code: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Profile endpoints
  async getProfile(token: string) {
    return this.request('/profile', { token });
  }

  async updateProfile(token: string, data: any) {
    return this.request('/profile', {
      method: 'PUT',
      token,
      body: JSON.stringify(data),
    });
  }

  // Events endpoints
  async getEvents() {
    return this.request('/events');
  }

  async getEvent(id: string) {
    return this.request(`/events/${id}`);
  }

  // Registrations endpoints
  async createRegistration(token: string, data: any) {
    return this.request('/registrations', {
      method: 'POST',
      token,
      body: JSON.stringify(data),
    });
  }

  async getRegistrations(token: string) {
    return this.request('/registrations', { token });
  }

  // Corporate requests
  async createCorporateRequest(data: any) {
    return this.request('/corporate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck() {
    return fetch(`${this.baseUrl.replace('/api', '')}/health`).then(r => r.json());
  }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
