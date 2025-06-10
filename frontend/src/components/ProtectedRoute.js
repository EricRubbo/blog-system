import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <div className="loading">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
              <p className="mt-3">Verificando autenticação...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated()) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Se estiver autenticado, renderizar o componente
  return children;
};

export default ProtectedRoute;

