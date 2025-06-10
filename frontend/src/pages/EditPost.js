console.log('🔍 EDITPOST CARREGADO - NOVA VERSÃO');

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/api';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    tags: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        console.log('📝 [EDIT] Carregando post ID:', id);
        
        // Tentar carregar o post diretamente - SEM VERIFICAÇÕES CHATAS
        const result = await postService.getById(id);
        
        if (result.success) {
          const post = result.data.post;
          console.log('📝 [EDIT] Post carregado:', post);
          
          setFormData({
            title: post.title,
            content: post.content,
            status: post.status,
            tags: post.tags || ''
          });
          
          console.log('✅ [EDIT] Formulário preenchido - PODE EDITAR!');
        } else {
          console.log('❌ [EDIT] Erro ao carregar:', result.error);
          setError('Erro ao carregar post');
        }
        
      } catch (error) {
        console.error('❌ [EDIT] Erro:', error);
        setError('Erro ao carregar post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('📝 [EDIT] Salvando post...');
      
      const result = await postService.update(id, formData);
      
      if (result.success) {
        setSuccess('Post atualizado com sucesso!');
        console.log('✅ [EDIT] Salvo com sucesso!');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        // Se der erro de permissão, mostrar mensagem específica
        if (result.error.includes('permissão')) {
          setError('Você não tem permissão para editar este post');
        } else {
          setError(result.error);
        }
      }
      
    } catch (error) {
      console.error('❌ [EDIT] Erro ao salvar:', error);
      setError('Erro ao salvar post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando post...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card">
            <div className="card-body">
              <h2 className="mb-4">
                <i className="bi bi-pencil-square me-2"></i>
                Editar Post
              </h2>

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
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">Título</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    maxLength="200"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="content" className="form-label">Conteúdo</label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="10"
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="tags" className="form-label">Tags</label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tecnologia, programação"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="status" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                  </select>
                </div>

                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Salvar
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
