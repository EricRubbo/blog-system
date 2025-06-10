import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { postService, getImageUrl, formatDate, parseTags } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const PostDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const response = await postService.getPost(id);
        setPost(response.data.post);
      } catch (error) {
        console.error('Erro ao carregar post:', error);
        if (error.response?.status === 404) {
          setError('Post não encontrado');
        } else {
          setError('Erro ao carregar post');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
          <p className="mt-3">Carregando post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
            <h3 className="mt-3">{error}</h3>
            <p className="text-muted">O post que você está procurando não foi encontrado ou não está disponível.</p>
            <Link to="/" className="btn btn-primary">
              <i className="bi bi-house me-2"></i>
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return null;
  }

  const isAuthor = isAuthenticated() && user?.id === post.author_id;

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Botão voltar */}
          <div className="mb-4">
            <Link to="/" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar aos Posts
            </Link>
            
            {isAuthor && (
              <Link 
                to={`/edit-post/${post.id}`} 
                className="btn btn-primary ms-2"
              >
                <i className="bi bi-pencil me-2"></i>
                Editar Post
              </Link>
            )}
          </div>

          {/* Post */}
          <article className="card shadow-custom border-radius-custom">
            {/* Imagem de capa */}
            {post.image && (
              <img
                src={getImageUrl(post.image)}
                className="card-img-top"
                alt={post.title}
                style={{ height: '400px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            
            <div className="card-body p-5">
              {/* Cabeçalho */}
              <header className="mb-4">
                <h1 className="display-5 fw-bold text-gradient mb-3">
                  {post.title}
                </h1>
                
                <div className="d-flex flex-wrap align-items-center text-muted mb-3">
                  <div className="me-4 mb-2">
                    <i className="bi bi-person me-2"></i>
                    <strong>{post.author_name}</strong>
                  </div>
                  <div className="me-4 mb-2">
                    <i className="bi bi-calendar me-2"></i>
                    {formatDate(post.created_at)}
                  </div>
                  {post.updated_at !== post.created_at && (
                    <div className="me-4 mb-2">
                      <i className="bi bi-pencil me-2"></i>
                      Atualizado em {formatDate(post.updated_at)}
                    </div>
                  )}
                </div>

                {/* Tags */}
                {post.tags && (
                  <div className="mb-4">
                    {parseTags(post.tags).map((tag, index) => (
                      <span key={index} className="tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </header>

              {/* Conteúdo */}
              <div 
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
          </article>

          {/* Ações do autor */}
          {isAuthor && (
            <div className="card mt-4 border-warning">
              <div className="card-body">
                <h6 className="card-title">
                  <i className="bi bi-tools me-2"></i>
                  Ações do Autor
                </h6>
                <p className="card-text text-muted">
                  Este é seu post. Você pode editá-lo ou gerenciá-lo através do dashboard.
                </p>
                <div className="d-flex gap-2">
                  <Link 
                    to={`/edit-post/${post.id}`} 
                    className="btn btn-warning btn-sm"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Editar
                  </Link>
                  <Link 
                    to="/dashboard" 
                    className="btn btn-outline-primary btn-sm"
                  >
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Call to action para visitantes */}
          {!isAuthenticated() && (
            <div className="card mt-4 bg-light">
              <div className="card-body text-center">
                <h5 className="card-title">Gostou do conteúdo?</h5>
                <p className="card-text">
                  Junte-se à nossa comunidade e comece a compartilhar seu conhecimento também!
                </p>
                <div className="d-flex justify-content-center gap-2">
                  <Link to="/register" className="btn btn-primary">
                    <i className="bi bi-person-plus me-2"></i>
                    Criar Conta
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary">
                    <i className="bi bi-box-arrow-in-right me-2"></i>
                    Fazer Login
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Navegação */}
          <div className="text-center mt-5 mb-4">
            <Link to="/" className="btn btn-lg btn-primary">
              <i className="bi bi-grid me-2"></i>
              Ver Mais Posts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

