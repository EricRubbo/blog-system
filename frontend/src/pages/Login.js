import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpar erro quando o usuário começar a digitar
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Redirecionar para a página de origem ou dashboard
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-custom border-radius-custom">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <i className="bi bi-box-arrow-in-right text-gradient" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3 text-gradient">Fazer Login</h2>
                <p className="text-muted">Entre na sua conta para continuar</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Senha
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Sua senha"
                    autoComplete="current-password"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Entrando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Entrar
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-muted mb-0">
                  Não tem uma conta?{' '}
                  <Link to="/register" className="text-decoration-none">
                    Cadastre-se aqui
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="text-center mt-4">
            <div className="row">
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-shield-check text-success" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Seguro</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-lightning text-warning" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Rápido</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-heart text-danger" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Fácil</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

