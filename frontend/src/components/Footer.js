import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>
              <i className="bi bi-journal-text me-2"></i>
              Blog System
            </h5>
            <p className="mb-0">
              Sistema de blog moderno e responsivo para criadores de conteúdo.
            </p>
          </div>
          
          <div className="col-md-3">
            <h6>Links Úteis</h6>
            <ul className="list-unstyled">
              <li>
                <a href="/" className="text-light text-decoration-none">
                  <i className="bi bi-house me-1"></i>
                  Início
                </a>
              </li>
              <li>
                <a href="/login" className="text-light text-decoration-none">
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Entrar
                </a>
              </li>
              <li>
                <a href="/register" className="text-light text-decoration-none">
                  <i className="bi bi-person-plus me-1"></i>
                  Cadastrar
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-md-3">
            <h6>Recursos</h6>
            <ul className="list-unstyled">
              <li>
                <span className="text-light">
                  <i className="bi bi-check-circle me-1"></i>
                  Editor de Posts
                </span>
              </li>
              <li>
                <span className="text-light">
                  <i className="bi bi-check-circle me-1"></i>
                  Upload de Imagens
                </span>
              </li>
              <li>
                <span className="text-light">
                  <i className="bi bi-check-circle me-1"></i>
                  Design Responsivo
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <hr className="my-4" style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
        
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">
              © {currentYear} Blog System. Todos os direitos reservados.
            </p>
          </div>
          
          <div className="col-md-6 text-md-end">
            <div className="d-flex justify-content-md-end justify-content-center">
              <a 
                href="#" 
                className="text-light me-3" 
                style={{ fontSize: '1.2rem' }}
                title="GitHub"
              >
                <i className="bi bi-github"></i>
              </a>
              <a 
                href="#" 
                className="text-light me-3" 
                style={{ fontSize: '1.2rem' }}
                title="Twitter"
              >
                <i className="bi bi-twitter"></i>
              </a>
              <a 
                href="#" 
                className="text-light" 
                style={{ fontSize: '1.2rem' }}
                title="LinkedIn"
              >
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

