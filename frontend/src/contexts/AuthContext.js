import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Verificar se há um token salvo e validá-lo
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log('🔐 [AUTH] Verificando autenticação...', { 
        hasToken: !!savedToken, 
        hasUser: !!savedUser 
      });
      
      if (savedToken && savedUser) {
        try {
          // Primeiro, tentar usar dados salvos
          const userData = JSON.parse(savedUser);
          console.log('🔐 [AUTH] Dados do usuário carregados do localStorage:', userData);
          
          // Configurar token no header da API
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          
          // Verificar se o token é válido usando o endpoint correto
          const response = await api.get('/auth/verify');
          console.log('🔐 [AUTH] Token verificado com sucesso');
          
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          console.error('❌ [AUTH] Token inválido:', error);
          // Token inválido, remover do localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      } else if (savedToken) {
        // Tem token mas não tem dados do usuário - tentar verificar
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
          const response = await api.get('/auth/verify');
          
          if (response.data.user) {
            console.log('🔐 [AUTH] Usuário recuperado via verify:', response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            setToken(savedToken);
          }
        } catch (error) {
          console.error('❌ [AUTH] Erro ao verificar token:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          delete api.defaults.headers.common['Authorization'];
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (email, password) => {
    try {
      console.log('🔐 [AUTH] Tentando fazer login...');
      const response = await api.post('/auth/login', { email, password });
      const { user: userData, token: userToken } = response.data;
      
      console.log('🔐 [AUTH] Login bem-sucedido:', userData);
      
      // Salvar TANTO token QUANTO dados do usuário no localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Configurar token no header da API
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Atualizar estado
      setUser(userData);
      setToken(userToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao fazer login';
      return { success: false, error: errorMessage };
    }
  };

  // Função de registro
  const register = async (name, email, password) => {
    try {
      console.log('🔐 [AUTH] Tentando registrar...');
      const response = await api.post('/auth/register', { name, email, password });
      const { user: userData, token: userToken } = response.data;
      
      console.log('🔐 [AUTH] Registro bem-sucedido:', userData);
      
      // Salvar TANTO token QUANTO dados do usuário no localStorage
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Configurar token no header da API
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
      
      // Atualizar estado
      setUser(userData);
      setToken(userToken);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('❌ [AUTH] Erro no registro:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao criar conta';
      return { success: false, error: errorMessage };
    }
  };

  // Função de logout
  const logout = async () => {
    try {
      console.log('🔐 [AUTH] Fazendo logout...');
      // Chamar endpoint de logout (opcional)
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      setToken(null);
      console.log('🔐 [AUTH] Logout concluído');
    }
  };

  // Função para atualizar perfil
  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      const updatedUser = response.data.user;
      
      // Atualizar localStorage também
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('❌ [AUTH] Erro ao atualizar perfil:', error);
      
      const errorMessage = error.response?.data?.error || 'Erro ao atualizar perfil';
      return { success: false, error: errorMessage };
    }
  };

  // Verificar se o usuário está autenticado
  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
