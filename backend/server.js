const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { initializeDatabase } = require('./database');

const app = express();
const PORT = process.env.PORT || 10000;

// Inicializar banco de dados
initializeDatabase();

// Middleware de segurança
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Configurar CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://blog-system-0okj.onrender.com'] 
    : ['http://localhost:3000'],
  credentials: true
} ));

// Rate limiting
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: {
        error: 'Muitas tentativas. Tente novamente em alguns minutos.'
    }
});
app.use('/api/', limiter);

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Importar e usar rotas uma por uma (para identificar qual está com problema)
try {
    const authRoutes = require('./routes/auth');
    console.log('✅ Auth routes carregadas:', typeof authRoutes);
    app.use('/api/auth', authRoutes);
} catch (error) {
    console.error('❌ Erro ao carregar auth routes:', error.message);
}

try {
    const postRoutes = require('./routes/posts');
    console.log('✅ Post routes carregadas:', typeof postRoutes);
    app.use('/api/posts', postRoutes);
} catch (error) {
    console.error('❌ Erro ao carregar post routes:', error.message);
}

try {
    const uploadRoutes = require('./routes/upload');
    console.log('✅ Upload routes carregadas:', typeof uploadRoutes);
    app.use('/api/upload', uploadRoutes);
} catch (error) {
    console.error('❌ Erro ao carregar upload routes:', error.message);
}

try {
    const commentRoutes = require('./routes/comments');
    console.log('✅ Comment routes carregadas:', typeof commentRoutes);
    app.use('/api', commentRoutes);
} catch (error) {
    console.error('❌ Erro ao carregar comment routes:', error.message);
}

// Servir arquivos estáticos do frontend em produção
if (process.env.NODE_ENV === 'production') {
  // Servir arquivos estáticos do build do React
  app.use(express.static(path.join(__dirname, '../frontend/build')));
}

// Rota de debug (adicione após as outras rotas)
app.get('/api/debug/users', async (req, res) => {
    try {
        const User = require('./models/User');
        const users = await User.listAll();
        res.json({
            message: 'Lista de usuários',
            count: users.length,
            users: users
        });
    } catch (error) {
        console.error('Erro no debug:', error);
        res.status(500).json({ error: error.message });
    }
});

// Rota de teste
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API do Blog funcionando!', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Para todas as rotas que não são da API, servir o index.html do React
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
    }
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro:', err.stack);
    res.status(500).json({ 
        error: 'Algo deu errado no servidor!',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
    });
});

// Middleware para rotas não encontradas (apenas para APIs)
app.use('/api/*', (req, res) => {
    res.status(404).json({ 
        error: 'Rota não encontrada',
        path: req.originalUrl
    });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📱 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}/api/test` );
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Encerrando servidor...');
    process.exit(0);
});

module.exports = app;
