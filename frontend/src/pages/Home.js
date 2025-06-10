import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postService, getImageUrl, formatDate, truncateText, parseTags } from '../services/api';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar posts
  const loadPosts = async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const response = await postService.getPosts({
        page,
        limit: 6,
        search: searchTerm
      });
      
      setPosts(response.data.posts);
      setPagination(response.data.pagination);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Erro ao carregar posts. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  // Buscar posts
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts(1, search);
  };

  // Navegar páginas
  const handlePageChange = (page) => {
    loadPosts(page, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="hero-title">
                Bem-vindo ao Blog System
              </h1>
              <p className="hero-subtitle">
                Descubra histórias incríveis, compartilhe conhecimento e conecte-se com uma comunidade de criadores de conteúdo.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link to="/register" className="btn btn-light btn-lg">
                  <i className="bi bi-person-plus me-2"></i>
                  Começar Agora
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Posts */}
      <section className="py-5">
        <div className="container">
          {/* Barra de busca */}
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto">
              <form onSubmit={handleSearch}>
                <div className="input-group input-group-lg">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar posts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-primary" type="submit">
                    <i className="bi bi-search"></i>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Título da seção */}
          <div className="row mb-4">
            <div className="col-12 text-center">
              <h2 className="text-gradient">
                {search ? `Resultados para "${search}"` : 'Posts Recentes'}
              </h2>
              <p className="text-muted">
                {pagination.total ? `${pagination.total} post(s) encontrado(s)` : 'Explore nosso conteúdo'}
              </p>
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
                    <div key={post.id} className="col-lg-4 col-md-6 mb-4">
                      <div className="card h-100 fade-in">
                        {post.image && (
                          <img
                            src={getImageUrl(post.image)}
                            className="card-img-top"
                            alt={post.title}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        
                        <div className="card-body d-flex flex-column">
                          <h5 className="card-title">
                            <Link 
                              to={`/post/${post.id}`} 
                              className="text-decoration-none text-dark"
                            >
                              {post.title}
                            </Link>
                          </h5>
                          
                          <p className="card-text text-muted flex-grow-1">
                            {truncateText(post.content.replace(/<[^>]*>/g, ''), 120)}
                          </p>
                          
                          {/* Tags */}
                          {post.tags && (
                            <div className="mb-3">
                              {parseTags(post.tags).slice(0, 3).map((tag, index) => (
                                <span key={index} className="tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <small className="text-muted">
                              <i className="bi bi-person me-1"></i>
                              {post.author_name}
                            </small>
                            <small className="text-muted">
                              <i className="bi bi-calendar me-1"></i>
                              {formatDate(post.created_at)}
                            </small>
                          </div>
                          
                          <Link 
                            to={`/post/${post.id}`} 
                            className="btn btn-primary mt-3"
                          >
                            <i className="bi bi-book me-1"></i>
                            Ler Mais
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#dee2e6' }}></i>
                  <h4 className="mt-3 text-muted">
                    {search ? 'Nenhum post encontrado' : 'Nenhum post publicado ainda'}
                  </h4>
                  <p className="text-muted">
                    {search 
                      ? 'Tente buscar por outros termos.' 
                      : 'Seja o primeiro a compartilhar seu conhecimento!'
                    }
                  </p>
                  {!search && (
                    <Link to="/register" className="btn btn-primary">
                      <i className="bi bi-person-plus me-2"></i>
                      Criar Conta
                    </Link>
                  )}
                </div>
              )}

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="row mt-5">
                  <div className="col-12">
                    <nav aria-label="Navegação de páginas">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${!pagination.hasPrev ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={!pagination.hasPrev}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </li>
                        
                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                          <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        ))}
                        
                        <li className={`page-item ${!pagination.hasNext ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={!pagination.hasNext}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;

