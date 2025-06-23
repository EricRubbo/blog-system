const { Pool } = require('pg');

// Configuração do banco de dados
const isProduction = process.env.NODE_ENV === 'production';

// Pool de conexões PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Função para executar queries
const query = (text, params) => {
    return pool.query(text, params);
};

// Função para inicializar as tabelas
const initializeDatabase = async () => {
    try {
        console.log('🗄️ [DATABASE] Inicializando banco PostgreSQL...');
        
        // Tabela de usuários
        await query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                avatar VARCHAR(255),
                bio TEXT,
                role VARCHAR(20) DEFAULT 'user',
                status VARCHAR(20) DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de posts
        await query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                title VARCHAR(200) NOT NULL,
                content TEXT NOT NULL,
                author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                status VARCHAR(20) DEFAULT 'draft',
                image VARCHAR(255),
                tags TEXT,
                views INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Tabela de comentários
        await query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
                author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                author_name VARCHAR(100),
                content TEXT NOT NULL,
                status VARCHAR(20) DEFAULT 'approved',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Índices para melhor performance
        await query(`
            CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
        `);
        
        await query(`
            CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
        `);

        console.log('✅ [DATABASE] Tabelas criadas/verificadas com sucesso!');
        
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao inicializar banco:', error);
        throw error;
    }
};

// Função para testar conexão
const testConnection = async () => {
    try {
        const result = await query('SELECT NOW() as current_time');
        console.log('✅ [DATABASE] Conexão PostgreSQL estabelecida:', result.rows[0].current_time);
        return true;
    } catch (error) {
        console.error('❌ [DATABASE] Erro na conexão:', error);
        return false;
    }
};

// Função para fechar conexões (graceful shutdown)
const closePool = async () => {
    try {
        await pool.end();
        console.log('✅ [DATABASE] Pool de conexões fechado');
    } catch (error) {
        console.error('❌ [DATABASE] Erro ao fechar pool:', error);
    }
};

// Event listeners para graceful shutdown
process.on('SIGINT', async () => {
    console.log('🔄 [DATABASE] Recebido SIGINT, fechando conexões...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('🔄 [DATABASE] Recebido SIGTERM, fechando conexões...');
    await closePool();
    process.exit(0);
});

module.exports = {
    query,
    pool,
    initializeDatabase,
    testConnection,
    closePool
};

