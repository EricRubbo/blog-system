const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticateToken = async (req, res, next) => {
    try {
        console.log('🔐 [AUTH] Iniciando autenticação...');
        
        const authHeader = req.headers['authorization'];
        console.log('🔐 [AUTH] Header authorization:', authHeader ? 'Presente' : 'Ausente');
        
        const token = authHeader && authHeader.split(' ')[1];
        console.log('🔐 [AUTH] Token extraído:', token ? 'Presente' : 'Ausente');

        if (!token) {
            console.log('❌ [AUTH] Token não fornecido');
            return res.status(401).json({
                error: 'Token de acesso requerido',
                code: 'NO_TOKEN'
            });
        }

        console.log('🔐 [AUTH] Verificando token JWT...');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('🔐 [AUTH] Token decodificado:', { id: decoded.id, email: decoded.email });

        console.log('🔐 [AUTH] Buscando usuário no banco...');
        const user = await User.findById(decoded.id);
        console.log('🔐 [AUTH] Usuário encontrado:', user ? { id: user.id, name: user.name, email: user.email } : 'null');

        if (!user) {
            console.log('❌ [AUTH] Usuário não encontrado no banco');
            return res.status(401).json({
                error: 'Usuário não encontrado',
                code: 'USER_NOT_FOUND'
            });
        }

        req.user = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        
        console.log('✅ [AUTH] Autenticação bem-sucedida para:', req.user.name);
        next();

    } catch (error) {
        console.error('❌ [AUTH] Erro na autenticação:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expirado',
                code: 'EXPIRED_TOKEN'
            });
        }

        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
};

module.exports = { authenticateToken };
