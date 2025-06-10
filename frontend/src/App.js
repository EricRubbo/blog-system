import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { authService, postService, commentService } from './services/api';

// Estilos inline completos
const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    backgroundColor: '#f8f9fa',
    color: '#333',
    lineHeight: '1.6'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '1rem 2rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    marginBottom: '1rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    margin: '0 0 1rem 0'
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap'
  },
  navLink: {
    color: 'white',
    textDecoration: 'none',
    fontWeight: '500',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.1)'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginLeft: 'auto'
  },
  userBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '25px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  mainContent: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%'
  },
  card: {
    background: 'white',
    borderRadius: '15px',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    marginBottom: '2rem',
    transition: 'all 0.3s ease'
  },
  cardHeader: {
    borderBottom: '2px solid #f1f3f4',
    paddingBottom: '1rem',
    marginBottom: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '0.5rem',
    margin: '0 0 0.5rem 0'
  },
  cardSubtitle: {
    color: '#666',
    fontSize: '0.9rem',
    margin: '0'
  },
  btn: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '25px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.9rem'
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white'
  },
  btnSuccess: {
    background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
    color: 'white'
  },
  btnDanger: {
    background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
    color: 'white'
  },
  btnWarning: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white'
  },
  btnSecondary: {
    background: 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)',
    color: 'white'
  },
  alert: {
    padding: '1rem 1.5rem',
    borderRadius: '10px',
    marginBottom: '1.5rem',
    borderLeft: '4px solid',
    fontWeight: '500'
  },
  alertSuccess: {
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    borderLeftColor: '#28a745',
    color: '#155724'
  },
  alertError: {
    background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
    borderLeftColor: '#dc3545',
    color: '#721c24'
  },
  formGroup: {
    marginBottom: '1.5rem'
  },
  formLabel: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: '600',
    color: '#333'
  },
  formControl: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e9ecef',
    borderRadius: '10px',
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    background: 'white',
    boxSizing: 'border-box'
  },
  textarea: {
    minHeight: '200px',
    resize: 'vertical',
    fontFamily: 'inherit'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem'
  },
  statCard: {
    background: 'white',
    padding: '2rem',
    borderRadius: '15px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden'
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text'
  },
  statLabel: {
    color: '#666',
    fontWeight: '500',
    margin: '0'
  },
  postsGrid: {
    display: 'grid',
    gap: '1.5rem'
  },
  postCard: {
    background: 'white',
    borderRadius: '15px',
    padding: '1.5rem',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
    borderLeft: '4px solid #667eea'
  },
  postHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem'
  },
  postTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#333',
    marginBottom: '0.5rem',
    lineHeight: '1.4',
    margin: '0 0 0.5rem 0'
  },
  postMeta: {
    color: '#666',
    fontSize: '0.9rem',
    marginBottom: '1rem'
  },
  postContent: {
    color: '#555',
    lineHeight: '1.6',
    marginBottom: '1rem'
  },
  postActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap'
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '1rem'
  },
  tag: {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.25rem'
  },
  statusPublished: {
    background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
    color: '#155724'
  },
  statusDraft: {
    background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
    color: '#856404'
  },
  emptyState: {
    textAlign: 'center',
    padding: '3rem 2rem',
    background: 'white',
    borderRadius: '15px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
  },
  emptyStateIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: '0.5'
  },
  emptyStateTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.5rem',
    color: '#333'
  },
  emptyStateText: {
    color: '#666',
    marginBottom: '1.5rem'
  },
  loading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    color: '#666'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '2px solid #f3f3f3',
    borderTop: '2px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '0.5rem'
  },
  footer: {
    background: '#2c3e50',
    color: 'white',
    textAlign: 'center',
    padding: '2rem',
    marginTop: 'auto'
  },
  commentsSection: {
    marginTop: '2rem',
    padding: '1.5rem',
    background: '#f8f9fa',
    borderRadius: '10px'
  },
  commentCard: {
    background: 'white',
    padding: '1rem',
    borderRadius: '10px',
    marginBottom: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  commentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem'
  },
  commentAuthor: {
    fontWeight: '600',
    color: '#333'
  },
  commentDate: {
    fontSize: '0.8rem',
    color: '#666'
  },
  commentContent: {
    color: '#555',
    lineHeight: '1.5'
  },
  commentForm: {
    marginTop: '1rem',
    padding: '1rem',
    background: 'white',
    borderRadius: '10px'
  },
  w100: { width: '100%' },
  mt3: { marginTop: '1.5rem' },
  mt4: { marginTop: '2rem' },
  mb3: { marginBottom: '1.5rem' },
  mb4: { marginBottom: '2rem' },
  textCenter: { textAlign: 'center' },
  dFlex: { display: 'flex' },
  gap2: { gap: '1rem' }
};

// Componente Home
const Home = ({ isLoggedIn, userName }) => {
  const [connectionStatus, setConnectionStatus] = useState('Testando...');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const connectionResult = await authService.testConnection();
      setConnectionStatus(connectionResult.success ? '✅ Conectado ao backend' : '❌ Erro de conexão');

      const postsResult = await postService.getPublic();
      if (postsResult.success) {
        setPosts(postsResult.data.posts);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>Bem-vindo ao Blog System</h2>
          <p style={styles.cardSubtitle}>Sistema de blog moderno e responsivo</p>
        </div>

        {isLoggedIn && userName && (
          <div style={styles.alert}>
            <div style={styles.alertSuccess}>
              <h3 style={{margin: '0 0 0.5rem 0'}}>👋 Olá, {userName}!</h3>
              <p style={{margin: '0 0 1rem 0'}}>Você está logado com sucesso!</p>
              <Link to="/dashboard" style={{...styles.btn, ...styles.btnPrimary}}>
                🚀 Ir para Dashboard
              </Link>
            </div>
          </div>
        )}

        <div style={styles.mt4}>
          <h3 style={styles.mb3}>📝 Posts Publicados</h3>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              Carregando posts...
            </div>
          ) : posts.length > 0 ? (
            <div style={styles.postsGrid}>
              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <div>
                      <h4 style={styles.postTitle}>{post.title}</h4>
                      <div style={styles.postMeta}>
                        Por <strong>{post.author_name}</strong> • {new Date(post.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <span style={{...styles.statusBadge, ...styles.statusPublished}}>
                      ✅ Publicado
                    </span>
                  </div>
                  
                  <div style={styles.postContent}>
                    {post.content.length > 200 ? post.content.substring(0, 200) + '...' : post.content}
                  </div>
                  
                  {post.tags && (
                    <div style={styles.tags}>
                      {post.tags.split(',').map((tag, index) => (
                        <span key={index} style={styles.tag}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div style={{...styles.postActions, marginTop: '1rem'}}>
                    <Link 
                      to={`/post/${post.id}`}
                      style={{...styles.btn, ...styles.btnPrimary, fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                    >
                      📖 Ler Mais
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📝</div>
              <h3 style={styles.emptyStateTitle}>Nenhum post publicado ainda</h3>
              <p style={styles.emptyStateText}>
                {isLoggedIn 
                  ? "Seja o primeiro a compartilhar suas ideias!" 
                  : "Faça login para começar a escrever!"
                }
              </p>
              {isLoggedIn && (
                <Link to="/create-post" style={{...styles.btn, ...styles.btnSuccess}}>
                  ✏️ Criar Primeiro Post
                </Link>
              )}
            </div>
          )}
        </div>

        <div style={{...styles.card, ...styles.mt4}}>
          <h3 style={styles.cardTitle}>Status do Sistema</h3>
          <div style={{...styles.dFlex, ...styles.gap2, flexWrap: 'wrap'}}>
            <span style={{...styles.statusBadge, ...styles.statusPublished}}>✅ Frontend funcionando</span>
            <span style={{...styles.statusBadge, ...styles.statusPublished}}>{connectionStatus}</span>
            <span style={{...styles.statusBadge, ...styles.statusPublished}}>✅ Navegação funcionando</span>
            <span style={{...styles.statusBadge, ...(isLoggedIn ? styles.statusPublished : styles.statusDraft)}}>
              {isLoggedIn ? '✅ Usuário logado' : '⚪ Usuário não logado'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente PostDetail
const PostDetail = ({ isLoggedIn, user }) => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    const result = await postService.getById(id);
    if (result.success) {
      setPost(result.data.post);
      setComments(result.data.post.comments || []);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmittingComment(true);
    const result = await commentService.create(id, commentContent);
    
    if (result.success) {
      setCommentContent('');
      loadPost();
    } else {
      alert('Erro ao adicionar comentário: ' + result.error);
    }
    
    setSubmittingComment(false);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Tem certeza que deseja deletar este comentário?')) {
      const result = await commentService.delete(commentId);
      if (result.success) {
        loadPost();
      } else {
        alert('Erro ao deletar comentário: ' + result.error);
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        Carregando post...
      </div>
    );
  }

  if (error || !post) {
    return (
      <div style={styles.card}>
        <div style={{...styles.alert, ...styles.alertError}}>
          {error || 'Post não encontrado'}
        </div>
        <Link to="/" style={{...styles.btn, ...styles.btnPrimary}}>
          ← Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h1 style={{...styles.cardTitle, fontSize: '2rem'}}>{post.title}</h1>
          <div style={styles.postMeta}>
            Por <strong>{post.author_name}</strong> • {new Date(post.created_at).toLocaleDateString('pt-BR')}
            {post.updated_at !== post.created_at && (
              <span> • Atualizado em {new Date(post.updated_at).toLocaleDateString('pt-BR')}</span>
            )}
          </div>
          <div style={{marginTop: '1rem'}}>
            <span style={{...styles.statusBadge, ...(post.status === 'published' ? styles.statusPublished : styles.statusDraft)}}>
              {post.status === 'published' ? '✅ Publicado' : '📝 Rascunho'}
            </span>
          </div>
        </div>

        <div style={{...styles.postContent, fontSize: '1.1rem', lineHeight: '1.8'}}>
          {post.content.split('\n').map((paragraph, index) => (
            <p key={index} style={{marginBottom: '1rem'}}>{paragraph}</p>
          ))}
        </div>

        {post.tags && (
          <div style={styles.tags}>
            {post.tags.split(',').map((tag, index) => (
              <span key={index} style={styles.tag}>
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        <div style={{...styles.dFlex, ...styles.gap2, marginTop: '2rem'}}>
          <Link to="/" style={{...styles.btn, ...styles.btnSecondary}}>
            ← Voltar ao Início
          </Link>
          {isLoggedIn && user && user.id === post.author_id && (
            <Link to={`/edit-post/${post.id}`} style={{...styles.btn, ...styles.btnWarning}}>
              ✏️ Editar Post
            </Link>
          )}
        </div>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>💬 Comentários ({comments.length})</h3>
        
        {isLoggedIn ? (
          <div style={styles.commentForm}>
            <form onSubmit={handleAddComment}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Adicionar Comentário</label>
                <textarea
                  style={{...styles.formControl, minHeight: '100px'}}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Escreva seu comentário..."
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={submittingComment}
                style={{...styles.btn, ...styles.btnSuccess}}
              >
                {submittingComment ? (
                  <>
                    <div style={styles.spinner}></div>
                    Enviando...
                  </>
                ) : (
                  '💬 Comentar'
                )}
              </button>
            </form>
          </div>
        ) : (
          <div style={{...styles.alert, ...styles.alertError}}>
            <Link to="/login">Faça login</Link> para comentar neste post.
          </div>
        )}

        <div style={styles.commentsSection}>
          {comments.length > 0 ? (
            comments.map(comment => (
              <div key={comment.id} style={styles.commentCard}>
                <div style={styles.commentHeader}>
                  <div>
                    <span style={styles.commentAuthor}>👤 {comment.author_name}</span>
                    <span style={styles.commentDate}> • {new Date(comment.created_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                  {isLoggedIn && user && user.id === comment.author_id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      style={{...styles.btn, ...styles.btnDanger, fontSize: '0.7rem', padding: '0.25rem 0.5rem'}}
                    >
                      🗑️
                    </button>
                  )}
                </div>
                <div style={styles.commentContent}>
                  {comment.content}
                </div>
              </div>
            ))
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>💬</div>
              <h4 style={styles.emptyStateTitle}>Nenhum comentário ainda</h4>
              <p style={styles.emptyStateText}>Seja o primeiro a comentar!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente EditPost
const EditPost = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    setLoading(true);
    const result = await postService.getById(id);
    if (result.success) {
      const post = result.data.post;
      
      if (user && Number(user.id) !== Number(post.author_id)) { 
        setError('Você só pode editar seus próprios posts');
        setLoading(false);
        return;
      }
      
      setFormData({
        title: post.title,
        content: post.content,
        tags: post.tags || '',
        status: post.status
      });
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const result = await postService.update(id, formData);
    
    if (result.success) {
      alert('Post atualizado com sucesso!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        Carregando post...
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.card}>
        <div style={{...styles.alert, ...styles.alertError}}>
          {error}
        </div>
        <Link to="/dashboard" style={{...styles.btn, ...styles.btnPrimary}}>
          ← Voltar ao Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>✏️ Editar Post</h2>
          <p style={styles.cardSubtitle}>Atualize seu conteúdo</p>
        </div>
        
        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Título</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Digite o título do seu post..."
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Conteúdo</label>
            <textarea 
              style={{...styles.formControl, ...styles.textarea}}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Escreva o conteúdo do seu post aqui..."
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Tags</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="tecnologia, programação, web (separadas por vírgula)"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Status</label>
            <select 
              style={styles.formControl}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">📝 Rascunho</option>
              <option value="published">✅ Publicar</option>
            </select>
          </div>

          <div style={{...styles.dFlex, ...styles.gap2}}>
            <button 
              type="submit" 
              disabled={submitting}
              style={{...styles.btn, ...styles.btnSuccess}}
            >
              {submitting ? (
                <>
                  <div style={styles.spinner}></div>
                  Salvando...
                </>
              ) : (
                '💾 Salvar Alterações'
              )}
            </button>
            
            <Link to="/dashboard" style={{...styles.btn, ...styles.btnSecondary}}>
              ❌ Cancelar
            </Link>
            
            <Link to={`/post/${id}`} style={{...styles.btn, ...styles.btnPrimary}}>
              👁️ Visualizar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Dashboard
const Dashboard = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const result = await postService.getMy();
    if (result.success) {
      const userPosts = result.data.posts;
      setPosts(userPosts);
      
      setStats({
        total: userPosts.length,
        published: userPosts.filter(p => p.status === 'published').length,
        drafts: userPosts.filter(p => p.status === 'draft').length
      });
    }
    setLoading(false);
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Tem certeza que deseja deletar este post?')) {
      const result = await postService.delete(postId);
      if (result.success) {
        alert('Post deletado com sucesso!');
        loadPosts();
      } else {
        alert('Erro ao deletar post: ' + result.error);
      }
    }
  };

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>📊 Dashboard</h2>
          <p style={styles.cardSubtitle}>Bem-vindo ao seu painel de controle, {user?.name}!</p>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.total}</div>
            <div style={styles.statLabel}>Total de Posts</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.published}</div>
            <div style={styles.statLabel}>Publicados</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statNumber}>{stats.drafts}</div>
            <div style={styles.statLabel}>Rascunhos</div>
          </div>
        </div>

        <div style={styles.mb4}>
          <Link to="/create-post" style={{...styles.btn, ...styles.btnSuccess}}>
            ✏️ Criar Novo Post
          </Link>
        </div>

        <div>
          <h3 style={styles.mb3}>📝 Seus Posts</h3>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner}></div>
              Carregando seus posts...
            </div>
          ) : posts.length > 0 ? (
            <div style={styles.postsGrid}>
              {posts.map(post => (
                <div key={post.id} style={styles.postCard}>
                  <div style={styles.postHeader}>
                    <div>
                      <h4 style={styles.postTitle}>{post.title}</h4>
                      <div style={styles.postMeta}>
                        Criado em {new Date(post.created_at).toLocaleDateString('pt-BR')}
                        {post.updated_at !== post.created_at && (
                          <span> • Atualizado em {new Date(post.updated_at).toLocaleDateString('pt-BR')}</span>
                        )}
                      </div>
                    </div>
                    <span style={{...styles.statusBadge, ...(post.status === 'published' ? styles.statusPublished : styles.statusDraft)}}>
                      {post.status === 'published' ? '✅ Publicado' : '📝 Rascunho'}
                    </span>
                  </div>
                  
                  <div style={styles.postContent}>
                    {post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content}
                  </div>
                  
                  {post.tags && (
                    <div style={styles.tags}>
                      {post.tags.split(',').map((tag, index) => (
                        <span key={index} style={styles.tag}>
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div style={styles.postActions}>
                    <Link 
                      to={`/post/${post.id}`}
                      style={{...styles.btn, ...styles.btnPrimary, fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                    >
                      👁️ Ver
                    </Link>
                    <Link 
                      to={`/edit-post/${post.id}`}
                      style={{...styles.btn, ...styles.btnWarning, fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                    >
                      ✏️ Editar
                    </Link>
                    <button 
                      onClick={() => handleDelete(post.id)}
                      style={{...styles.btn, ...styles.btnDanger, fontSize: '0.8rem', padding: '0.4rem 0.8rem'}}
                    >
                      🗑️ Deletar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyStateIcon}>📝</div>
              <h3 style={styles.emptyStateTitle}>Você ainda não criou nenhum post</h3>
              <p style={styles.emptyStateText}>Comece a compartilhar suas ideias com o mundo!</p>
              <Link to="/create-post" style={{...styles.btn, ...styles.btnSuccess}}>
                ✏️ Criar Primeiro Post
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente CreatePost
const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: '',
    status: 'draft'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await postService.create(formData);
    
    if (result.success) {
      alert('Post criado com sucesso!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <h2 style={styles.cardTitle}>✏️ Criar Novo Post</h2>
          <p style={styles.cardSubtitle}>Compartilhe suas ideias com o mundo</p>
        </div>
        
        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Título</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Digite o título do seu post..."
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Conteúdo</label>
            <textarea 
              style={{...styles.formControl, ...styles.textarea}}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
              placeholder="Escreva o conteúdo do seu post aqui..."
              required
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Tags</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={formData.tags}
              onChange={(e) => setFormData({...formData, tags: e.target.value})}
              placeholder="tecnologia, programação, web (separadas por vírgula)"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Status</label>
            <select 
              style={styles.formControl}
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="draft">📝 Rascunho</option>
              <option value="published">✅ Publicar</option>
            </select>
          </div>

          <div style={{...styles.dFlex, ...styles.gap2}}>
            <button 
              type="submit" 
              disabled={loading}
              style={{...styles.btn, ...styles.btnSuccess}}
            >
              {loading ? (
                <>
                  <div style={styles.spinner}></div>
                  Salvando...
                </>
              ) : (
                '💾 Salvar Post'
              )}
            </button>
            
            <Link to="/dashboard" style={{...styles.btn, ...styles.btnSecondary}}>
              ❌ Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente Login
const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.login(formData.email, formData.password);
    
    if (result.success) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      onLoginSuccess(result.data.user);
      alert('Login realizado com sucesso!');
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={{...styles.cardHeader, ...styles.textCenter}}>
          <h2 style={styles.cardTitle}>🔐 Login</h2>
          <p style={styles.cardSubtitle}>Entre na sua conta</p>
        </div>
        
        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input 
              type="email" 
              style={styles.formControl}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Senha</label>
            <input 
              type="password" 
              style={styles.formControl}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Sua senha"
              required
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.btn, ...styles.btnPrimary, ...styles.w100}}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Entrando...
              </>
            ) : (
              '🚀 Entrar'
            )}
          </button>
        </form>
        
        <div style={{...styles.textCenter, ...styles.mt3}}>
          <p>Não tem uma conta? <Link to="/register">Cadastre-se aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

// Componente Register
const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      alert('Cadastro realizado com sucesso! Faça login para continuar.');
      navigate('/login');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <div style={styles.card}>
        <div style={{...styles.cardHeader, ...styles.textCenter}}>
          <h2 style={styles.cardTitle}>📝 Cadastrar</h2>
          <p style={styles.cardSubtitle}>Crie sua conta</p>
        </div>
        
        {error && (
          <div style={{...styles.alert, ...styles.alertError}}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Nome</label>
            <input 
              type="text" 
              style={styles.formControl}
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Seu nome completo"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Email</label>
            <input 
              type="email" 
              style={styles.formControl}
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="seu@email.com"
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.formLabel}>Senha</label>
            <input 
              type="password" 
              style={styles.formControl}
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Mínimo 6 caracteres"
              required
              minLength="6"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{...styles.btn, ...styles.btnSuccess, ...styles.w100}}
          >
            {loading ? (
              <>
                <div style={styles.spinner}></div>
                Cadastrando...
              </>
            ) : (
              '🎉 Criar Conta'
            )}
          </button>
        </form>
        
        <div style={{...styles.textCenter, ...styles.mt3}}>
          <p>Já tem uma conta? <Link to="/login">Faça login aqui</Link></p>
        </div>
      </div>
    </div>
  );
};

// Componente para proteger rotas
const ProtectedRoute = ({ children, isLoggedIn }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoggedIn) {
      alert('Você precisa estar logado para acessar esta página!');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    alert('Logout realizado com sucesso!');
  };

  return (
    <Router>
      <div style={styles.app}>
        <header style={styles.header}>
          <h1 style={styles.headerTitle}>Blog System</h1>
          <nav style={styles.nav}>
            <Link to="/" style={styles.navLink}>🏠 Início</Link>
            
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" style={styles.navLink}>📊 Dashboard</Link>
                <Link to="/create-post" style={styles.navLink}>✏️ Criar Post</Link>
                <div style={styles.userInfo}>
                  <div style={styles.userBadge}>
                    👤 {user?.name}
                  </div>
                  <button 
                    onClick={handleLogout} 
                    style={{...styles.btn, ...styles.btnDanger}}
                  >
                    🚪 Sair
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" style={styles.navLink}>🔐 Login</Link>
                <Link to="/register" style={styles.navLink}>📝 Cadastrar</Link>
              </>
            )}
          </nav>
        </header>
        
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} userName={user?.name} />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route path="/register" element={<Register />} />
            <Route path="/post/:id" element={<PostDetail isLoggedIn={isLoggedIn} user={user} />} />
            <Route path="/dashboard" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <Dashboard user={user} />
              </ProtectedRoute>
            } />
            <Route path="/create-post" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <CreatePost />
              </ProtectedRoute>
            } />
            <Route path="/edit-post/:id" element={
              <ProtectedRoute isLoggedIn={isLoggedIn}>
                <EditPost user={user} />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <footer style={styles.footer}>
          <p>&copy; 2025 Blog System. Desenvolvido com ❤️ por Manus AI</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;

