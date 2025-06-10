import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postService, getImageUrl, formatDate, truncateText } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0
  });

  // Carregar posts do usuário
  const loadMyPosts = async (status = null) => {
    try {
      setLoading(true);
      const response = await postService.getMyPosts(status);
      setPosts(response.data.posts);
      
      // Calcular estatísticas
      const allPosts = response.data.posts;
      setStats({
        total: allPosts.length,
        published: allPosts.filter(p => p.status === 'published').length,
        drafts: allPosts.filter(p => p.status === 'draft').length
      });
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Erro ao carregar seus posts. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyPosts();
  }, []);

  // Filtrar posts
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    const status = newFilter === 'all' ? null : newFilter;
    loadMyPosts(status);
  };

  // Deletar post
  const handleDeletePost = async (postId) => {
    if (!window.confirm('Tem certeza que deseja deletar este post?')) {
      return;
    }

    try {
      await postService.deletePost(postId);
      // Recarregar posts
      const status = filter === 'all' ? null : filter;
      loadMyPosts(status);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      alert('Erro ao deletar post. Tente novamente.');
    }
  };

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="text-gradient">Dashboard</h1>
              <p className="text-muted">Bem-vindo de volta, {user?.name}!</p>
            </div>
            <Link to="/create-post" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Novo Post
            </Link>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="stats-card posts">
            <h3>{stats.total}</h3>
            <p className="mb-0">
              <i className="bi bi-journal-text me-2"></i>
              Total de Posts
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <h3>{stats.published}</h3>
            <p className="mb-0">
              <i className="bi bi-eye me-2"></i>
              Publicados
            </p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stats-card drafts">
            <h3>{stats.drafts}</h3>
            <p className="mb-0">
              <i className="bi bi-file-earmark-text me-2"></i>
              Rascunhos
            </p>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="dashboard-card">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Meus Posts</h5>
              <div className="btn-group" role="group">
                <button
                  type="button"
                  className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('all')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'published' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('published')}
                >
                  Publicados
                </button>
                <button
                  type="button"
                  className={`btn ${filter === 'draft' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleFilterChange('draft')}
                >
                  Rascunhos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="loading">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Posts */}
      {!loading && !error && (
        <>
          {posts.length > 0 ? (
            <div className="row">
              {posts.map((post) => (
                <div key={post.id} className="col-lg-6 col-xl-4 mb-4">
                  <div className="card h-100">
                    {post.image && (
                      <img
                        src={getImageUrl(post.image)}
                        className="card-img-top"
                        alt={post.title}
                        style={{ height: '200px', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title">{post.title}</h5>
                        <span className={`badge ${post.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                          {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                        </span>
                      </div>
                      
                      <p className="card-text text-muted flex-grow-1">
                        {truncateText(post.content.replace(/<[^>]*>/g, ''), 100)}
                      </p>
                      
                      <div className="mb-3">
                        <small className="text-muted">
                          <i className="bi bi-calendar me-1"></i>
                          Criado em {formatDate(post.created_at)}
                        </small>
                        {post.updated_at !== post.created_at && (
                          <div>
                            <small className="text-muted">
                              <i className="bi bi-pencil me-1"></i>
                              Editado em {formatDate(post.updated_at)}
                            </small>
                          </div>
                        )}
                      </div>
                      
                      <div className="d-flex gap-2 mt-auto">
                        {post.status === 'published' && (
                          <Link 
                            to={`/post/${post.id}`} 
                            className="btn btn-outline-primary btn-sm"
                            target="_blank"
                          >
                            <i className="bi bi-eye me-1"></i>
                            Ver
                          </Link>
                        )}
                        <Link 
                          to={`/edit-post/${post.id}`} 
                          className="btn btn-primary btn-sm"
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Editar
                        </Link>
                        <button 
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeletePost(post.id)}
                        >
                          <i className="bi bi-trash me-1"></i>
                          Deletar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <i className="bi bi-journal-plus" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
              <h4 className="mt-3 text-muted">
                {filter === 'all' 
                  ? 'Você ainda não criou nenhum post' 
                  : `Nenhum post ${filter === 'published' ? 'publicado' : 'em rascunho'} encontrado`
                }
              </h4>
              <p className="text-muted">
                Comece criando seu primeiro post e compartilhe seu conhecimento!
              </p>
              <Link to="/create-post" className="btn btn-primary">
                <i className="bi bi-plus-circle me-2"></i>
                Criar Primeiro Post
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

