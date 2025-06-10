import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postService, uploadService, getImageUrl } from '../services/api';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    status: 'draft',
    image: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Limpar mensagens quando o usuário começar a digitar
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Upload de imagem
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não permitido. Use apenas: JPEG, PNG, GIF ou WebP');
      return;
    }

    // Validar tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 5MB');
      return;
    }

    try {
      setImageUploading(true);
      setError('');
      
      const response = await uploadService.uploadImage(file);
      const imageUrl = response.data.file.url;
      
      setFormData({
        ...formData,
        image: imageUrl
      });
      
      setImagePreview(getImageUrl(imageUrl));
      setSuccess('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(error.response?.data?.error || 'Erro ao enviar imagem');
    } finally {
      setImageUploading(false);
    }
  };

  // Remover imagem
  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: ''
    });
    setImagePreview('');
    // Limpar input de arquivo
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.title.trim()) {
      setError('Título é obrigatório');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Conteúdo é obrigatório');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await postService.createPost(formData);
      
      setSuccess('Post criado com sucesso!');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        if (formData.status === 'published') {
          navigate(`/post/${response.data.post.id}`);
        } else {
          navigate('/dashboard');
        }
      }, 2000);
      
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError(error.response?.data?.error || 'Erro ao criar post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-custom border-radius-custom">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h2 className="text-gradient mb-0">
                    <i className="bi bi-plus-circle me-2"></i>
                    Criar Novo Post
                  </h2>
                  <p className="text-muted">Compartilhe seu conhecimento com o mundo</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/dashboard')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Voltar
                </button>
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
                {/* Título */}
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">
                    <i className="bi bi-type me-2"></i>
                    Título do Post
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Digite um título atrativo para seu post"
                    maxLength="200"
                  />
                  <div className="form-text">
                    {formData.title.length}/200 caracteres
                  </div>
                </div>

                {/* Upload de Imagem */}
                <div className="mb-4">
                  <label htmlFor="image" className="form-label">
                    <i className="bi bi-image me-2"></i>
                    Imagem de Capa (Opcional)
                  </label>
                  
                  {imagePreview ? (
                    <div className="mb-3">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid border-radius-custom"
                        style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                      />
                      <div className="mt-2">
                        <button
                          type="button"
                          className="btn btn-danger btn-sm"
                          onClick={handleRemoveImage}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Remover Imagem
                        </button>
                      </div>
                    </div>
                  ) : (
                    <input
                      type="file"
                      className="form-control"
                      id="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={imageUploading}
                    />
                  )}
                  
                  {imageUploading && (
                    <div className="mt-2">
                      <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                      Enviando imagem...
                    </div>
                  )}
                  
                  <div className="form-text">
                    Formatos aceitos: JPEG, PNG, GIF, WebP. Tamanho máximo: 5MB
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-4">
                  <label htmlFor="tags" className="form-label">
                    <i className="bi bi-tags me-2"></i>
                    Tags (Opcional)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="tecnologia, programação, web development"
                    maxLength="500"
                  />
                  <div className="form-text">
                    Separe as tags por vírgula. Exemplo: tecnologia, programação, web
                  </div>
                </div>

                {/* Conteúdo */}
                <div className="mb-4">
                  <label htmlFor="content" className="form-label">
                    <i className="bi bi-file-text me-2"></i>
                    Conteúdo do Post
                  </label>
                  <textarea
                    className="form-control"
                    id="content"
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    required
                    rows="15"
                    placeholder="Escreva o conteúdo do seu post aqui. Você pode usar HTML básico para formatação."
                  ></textarea>
                  <div className="form-text">
                    Dica: Você pode usar HTML básico como &lt;p&gt;, &lt;h2&gt;, &lt;strong&gt;, &lt;em&gt;, etc.
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <label htmlFor="status" className="form-label">
                    <i className="bi bi-eye me-2"></i>
                    Status do Post
                  </label>
                  <select
                    className="form-select"
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="draft">Rascunho (não visível publicamente)</option>
                    <option value="published">Publicado (visível para todos)</option>
                  </select>
                </div>

                {/* Botões */}
                <div className="d-flex gap-3">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading || imageUploading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Criando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        {formData.status === 'published' ? 'Publicar Post' : 'Salvar Rascunho'}
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/dashboard')}
                    disabled={loading}
                  >
                    <i className="bi bi-x-circle me-2"></i>
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

export default CreatePost;

