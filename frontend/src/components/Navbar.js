import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom fixed-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <i className="bi bi-journal-text me-2"></i>
          Blog System
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house me-1"></i>
                Início
              </Link>
            </li>
            
            {isAuthenticated() && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">
                    <i className="bi bi-speedometer2 me-1"></i>
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/create-post">
                    <i className="bi bi-plus-circle me-1"></i>
                    Novo Post
                  </Link>
                </li>
              </>
            )}
          </ul>
          
          <ul className="navbar-nav">
            {isAuthenticated() ? (
              <>
                <li className="nav-item dropdown">
                  <a 
                    className="nav-link dropdown-toggle" 
                    href="#" 
                    role="button" 
                    data-bs-toggle="dropdown"
                  >
                    <i className="bi bi-person-circle me-1"></i>
                    {user?.name}
                  </a>
                  <ul className="dropdown-menu">
                    <li>
                      <Link className="dropdown-item" to="/profile">
                        <i className="bi bi-person me-2"></i>
                        Perfil
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/dashboard">
                        <i className="bi bi-speedometer2 me-2"></i>
                        Meus Posts
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button 
                        className="dropdown-item" 
                        onClick={handleLogout}
                      >
                        <i className="bi bi-box-arrow-right me-2"></i>
                        Sair
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    <i className="bi bi-box-arrow-in-right me-1"></i>
                    Entrar
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="btn btn-outline-light ms-2" to="/register">
                    <i className="bi bi-person-plus me-1"></i>
                    Cadastrar
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

