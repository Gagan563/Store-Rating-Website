const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:3001/api';

// Auth utilities
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) {
      throw new Error('Login failed');
    }
    
    return response.json();
  },

  register: async (data: {
    name: string;
    username?: string;
    email: string;
    address: string;
    password: string;
    role?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Registration failed');
    }
    
    return response.json();
  },
};

// Store utilities
export const storeAPI = {
  getStores: async () => {
    const response = await fetch(`${API_BASE_URL}/stores`);
    if (!response.ok) {
      throw new Error('Failed to fetch stores');
    }
    return response.json();
  },

  getStore: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/stores/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch store');
    }
    return response.json();
  },

  createStore: async (data: {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    description?: string;
  }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create store');
    }
    
    return response.json();
  },

  updateStore: async (id: string, data: {
    name: string;
    address: string;
    phone?: string;
    website?: string;
    description?: string;
  }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/stores/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update store');
    }
    
    return response.json();
  },

  deleteStore: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/stores/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete store');
    }
    
    return response.json();
  },
};

// Rating utilities
export const ratingAPI = {
  getStoreRatings: async (storeId: string) => {
    const response = await fetch(`${API_BASE_URL}/stores/${storeId}/ratings`);
    if (!response.ok) {
      throw new Error('Failed to fetch ratings');
    }
    return response.json();
  },

  addRating: async (data: {
    store_id: string;
    rating: number;
    comment?: string;
  }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add rating');
    }
    
    return response.json();
  },

  updateRating: async (id: string, data: {
    rating: number;
    comment?: string;
  }, token: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update rating');
    }
    
    return response.json();
  },

  deleteRating: async (id: string, token: string) => {
    const response = await fetch(`${API_BASE_URL}/ratings/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete rating');
    }
    
    return response.json();
  },
};

// Local storage utilities
export const storage = {
  getToken: () => typeof window !== 'undefined' ? localStorage.getItem('userToken') : null,
  setToken: (token: string) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('token', token); // Keep both for compatibility
  },
  getUser: () => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  clearAuth: () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  },
};
