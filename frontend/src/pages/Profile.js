import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpar erros quando o usuário começar a digitar
    if (error) setError('');
    if (success) setSuccess('');
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

    // Validar avatar (URL opcional)
    if (formData.avatar && !isValidUrl(formData.avatar)) {
      errors.avatar = 'URL do avatar inválida';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      
      if (result.success) {
        setSuccess('Perfil atualizado com sucesso!');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      avatar: user?.avatar || ''
    });
    setError('');
    setSuccess('');
    setValidationErrors({});
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-custom border-radius-custom">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                {/* Avatar */}
                <div className="mb-3">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="Avatar"
                      className="rounded-circle"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=667eea&color=fff&size=100`;
                      }}
                    />
                  ) : (
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white"
                      style={{ 
                        width: '100px', 
                        height: '100px', 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '2rem'
                      }}
                    >
                      {formData.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <h2 className="text-gradient">
                  <i className="bi bi-person-circle me-2"></i>
                  Meu Perfil
                </h2>
                <p className="text-muted">Gerencie suas informações pessoais</p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {success && (
                <div className="alert alert-success" role="alert">
                  <i className="bi bi-check-circle me-2"></i>
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-4">
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
                      />
                      {validationErrors.name && (
                        <div className="invalid-feedback">
                          {validationErrors.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-4">
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
                      />
                      {validationErrors.email && (
                        <div className="invalid-feedback">
                          {validationErrors.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="avatar" className="form-label">
                    <i className="bi bi-image me-2"></i>
                    URL do Avatar (Opcional)
                  </label>
                  <input
                    type="url"
                    className={`form-control ${validationErrors.avatar ? 'is-invalid' : ''}`}
                    id="avatar"
                    name="avatar"
                    value={formData.avatar}
                    onChange={handleChange}
                    placeholder="https://exemplo.com/sua-foto.jpg"
                  />
                  {validationErrors.avatar && (
                    <div className="invalid-feedback">
                      {validationErrors.avatar}
                    </div>
                  )}
                  <div className="form-text">
                    Cole a URL de uma imagem para usar como avatar. Se deixar em branco, será gerado um avatar automático.
                  </div>
                </div>

                {/* Informações da conta */}
                <div className="card bg-light mb-4">
                  <div className="card-body">
                    <h6 className="card-title">
                      <i className="bi bi-info-circle me-2"></i>
                      Informações da Conta
                    </h6>
                    <div className="row">
                      <div className="col-md-6">
                        <p className="mb-1">
                          <strong>ID do Usuário:</strong> {user?.id}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <p className="mb-1">
                          <strong>Membro desde:</strong> {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões */}
                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Salvar Alterações
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Resetar
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Dicas de segurança */}
          <div className="card mt-4 border-info">
            <div className="card-body">
              <h6 className="card-title text-info">
                <i className="bi bi-shield-check me-2"></i>
                Dicas de Segurança
              </h6>
              <ul className="mb-0 text-muted">
                <li>Mantenha suas informações sempre atualizadas</li>
                <li>Use um email válido para receber notificações importantes</li>
                <li>Evite compartilhar suas credenciais de acesso</li>
                <li>Para alterar sua senha, entre em contato com o suporte</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

