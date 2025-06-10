import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configurar axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
} );

// Interceptor para adicionar token automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Serviços de autenticação
export const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no login' 
      };
    }
  },

  register: async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro no cadastro' 
      };
    }
  },

  testConnection: async () => {
    try {
      const response = await api.get('/test');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  }
};

// Serviços de posts (atualizados)
export const postService = {
  // Criar post
  create: async (postData) => {
    try {
      const response = await api.post('/posts', postData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao criar post' 
      };
    }
  },

  // Buscar posts públicos
  getPublic: async () => {
    try {
      const response = await api.get('/posts');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao carregar posts' 
      };
    }
  },

  // Buscar meus posts
  getMy: async () => {
    try {
      const response = await api.get('/posts/my');
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao carregar seus posts' 
      };
    }
  },

  // Buscar post específico
  getById: async (id) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao carregar post' 
      };
    }
  },

  // Buscar post específico do usuário (para edição) - NOVO!
  getMyPost: async (id) => {
    try {
      const response = await api.get(`/posts/my/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao carregar post para edição' 
      };
    }
  },

  // Atualizar post
  update: async (id, postData) => {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao atualizar post' 
      };
    }
  },

  // Deletar post
  delete: async (id) => {
    try {
      const response = await api.delete(`/posts/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao deletar post' 
      };
    }
  }
};

// Serviços de comentários
export const commentService = {
  // Buscar comentários de um post
  getByPost: async (postId) => {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao carregar comentários' 
      };
    }
  },

  // Adicionar comentário
  create: async (postId, content) => {
    try {
      const response = await api.post(`/posts/${postId}/comments`, { content });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao adicionar comentário' 
      };
    }
  },

  // Deletar comentário
  delete: async (commentId) => {
    try {
      const response = await api.delete(`/comments/${commentId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao deletar comentário' 
      };
    }
  }
};

export default api;
