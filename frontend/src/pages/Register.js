import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirecionar se já estiver logado
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpar erros quando o usuário começar a digitar
    if (error) setError('');
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      errors.email = 'Email é obrigatório';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await register(formData.name, formData.email, formData.password);
      
      if (result.success) {
        navigate('/dashboard', { replace: true });
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
                <i className="bi bi-person-plus text-gradient" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3 text-gradient">Criar Conta</h2>
                <p className="text-muted">Junte-se à nossa comunidade de criadores</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    <i className="bi bi-person me-2"></i>
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    className={`form-control ${validationErrors.name ? 'is-invalid' : ''}`}
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Seu nome completo"
                    autoComplete="name"
                  />
                  {validationErrors.name && (
                    <div className="invalid-feedback">
                      {validationErrors.name}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </label>
                  <input
                    type="email"
                    className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="seu@email.com"
                    autoComplete="email"
                  />
                  {validationErrors.email && (
                    <div className="invalid-feedback">
                      {validationErrors.email}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>
                    Senha
                  </label>
                  <input
                    type="password"
                    className={`form-control ${validationErrors.password ? 'is-invalid' : ''}`}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  {validationErrors.password && (
                    <div className="invalid-feedback">
                      {validationErrors.password}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="bi bi-lock-fill me-2"></i>
                    Confirmar Senha
                  </label>
                  <input
                    type="password"
                    className={`form-control ${validationErrors.confirmPassword ? 'is-invalid' : ''}`}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Digite a senha novamente"
                    autoComplete="new-password"
                  />
                  {validationErrors.confirmPassword && (
                    <div className="invalid-feedback">
                      {validationErrors.confirmPassword}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Criando conta...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-person-plus me-2"></i>
                      Criar Conta
                    </>
                  )}
                </button>
              </form>

              <div className="text-center">
                <p className="text-muted mb-0">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-decoration-none">
                    Faça login aqui
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Benefícios */}
          <div className="text-center mt-4">
            <h6 className="text-muted mb-3">Por que se juntar a nós?</h6>
            <div className="row">
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-pencil-square text-primary" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Criar Posts</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-people text-success" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Comunidade</p>
                </div>
              </div>
              <div className="col-4">
                <div className="p-3">
                  <i className="bi bi-graph-up text-info" style={{ fontSize: '2rem' }}></i>
                  <p className="small text-muted mt-2 mb-0">Crescer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

