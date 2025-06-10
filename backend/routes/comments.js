const express = require('express' );
const { body, validationResult } = require('express-validator');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações para comentários
const commentValidation = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comentário deve ter entre 1 e 1000 caracteres')
];

// Buscar comentários de um post específico
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        console.log('💬 [COMMENTS] Buscando comentários para post:', req.params.postId);
        const postId = parseInt(req.params.postId);
        
        if (isNaN(postId)) {
            console.log('❌ [COMMENTS] ID do post inválido:', req.params.postId);
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        // Verificar se o post existe
        console.log('💬 [COMMENTS] Verificando se post existe...');
        const post = await Post.findById(postId);
        if (!post) {
            console.log('❌ [COMMENTS] Post não encontrado:', postId);
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        console.log('✅ [COMMENTS] Post encontrado:', post.title);
        
        // Buscar comentários do post
        console.log('💬 [COMMENTS] Buscando comentários...');
        const comments = await Comment.findByPost(postId);
        console.log('💬 [COMMENTS] Comentários encontrados:', comments.length);
        
        const count = await Comment.countByPost(postId);
        console.log('💬 [COMMENTS] Total de comentários:', count);
        
        // Log detalhado dos comentários
        comments.forEach((comment, index) => {
            console.log(`💬 [COMMENTS] Comentário ${index + 1}:`, {
                id: comment.id,
                author: comment.author_name,
                content: comment.content.substring(0, 50) + '...',
                created_at: comment.created_at
            });
        });
        
        res.json({
            comments,
            count,
            postId
        });
        
    } catch (error) {
        console.error('❌ [COMMENTS] Erro ao buscar comentários:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Criar novo comentário
router.post('/posts/:postId/comments', authenticateToken, commentValidation, async (req, res) => {
    try {
        console.log('💬 [COMMENTS] Criando novo comentário...');
        console.log('💬 [COMMENTS] Usuário:', req.user);
        console.log('💬 [COMMENTS] Post ID:', req.params.postId);
        console.log('💬 [COMMENTS] Conteúdo:', req.body.content);
        
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ [COMMENTS] Erros de validação:', errors.array());
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const postId = parseInt(req.params.postId);
        const { content } = req.body;
        
        if (isNaN(postId)) {
            console.log('❌ [COMMENTS] ID do post inválido:', req.params.postId);
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        // Verificar se o post existe e está publicado
        console.log('💬 [COMMENTS] Verificando post...');
        const post = await Post.findById(postId);
        if (!post) {
            console.log('❌ [COMMENTS] Post não encontrado:', postId);
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        
        console.log('💬 [COMMENTS] Post encontrado:', post.title, 'Status:', post.status);
        
        if (post.status !== 'published') {
            console.log('❌ [COMMENTS] Post não está publicado:', post.status);
            return res.status(403).json({
                error: 'Não é possível comentar em posts não publicados',
                code: 'POST_NOT_PUBLISHED'
            });
        }
        
        // Criar comentário
        console.log('💬 [COMMENTS] Criando comentário no banco...');
        const comment = await Comment.create({
            post_id: postId,
            author_id: req.user.id,
            author_name: req.user.name,
            content
        });
        
        console.log('✅ [COMMENTS] Comentário criado com sucesso:', comment.id);
        
        res.status(201).json({
            message: 'Comentário criado com sucesso',
            comment
        });
        
    } catch (error) {
        console.error('❌ [COMMENTS] Erro ao criar comentário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Rota de debug para listar todos os comentários
router.get('/debug/comments', async (req, res) => {
    try {
        console.log('🔍 [DEBUG] Listando todos os comentários...');
        const { db } = require('../database');
        
        db.all('SELECT * FROM comments ORDER BY created_at DESC', [], (err, rows) => {
            if (err) {
                console.error('❌ [DEBUG] Erro ao buscar comentários:', err);
                res.status(500).json({ error: err.message });
            } else {
                console.log('🔍 [DEBUG] Total de comentários no banco:', rows.length);
                rows.forEach((comment, index) => {
                    console.log(`🔍 [DEBUG] Comentário ${index + 1}:`, {
                        id: comment.id,
                        post_id: comment.post_id,
                        author_name: comment.author_name,
                        content: comment.content.substring(0, 50) + '...',
                        status: comment.status,
                        created_at: comment.created_at
                    });
                });
                
                res.json({
                    message: 'Lista de todos os comentários',
                    count: rows.length,
                    comments: rows
                });
            }
        });
        
    } catch (error) {
        console.error('❌ [DEBUG] Erro no debug:', error);
        res.status(500).json({ error: error.message });
    }
});

// Deletar comentário
router.delete('/comments/:id', authenticateToken, async (req, res) => {
    try {
        console.log('💬 [COMMENTS] Deletando comentário:', req.params.id);
        const commentId = parseInt(req.params.id);
        
        if (isNaN(commentId)) {
            return res.status(400).json({
                error: 'ID do comentário inválido',
                code: 'INVALID_COMMENT_ID'
            });
        }
        
        // Verificar se o usuário é o autor do comentário
        const isAuthor = await Comment.isAuthor(commentId, req.user.id);
        if (!isAuthor) {
            return res.status(403).json({
                error: 'Você não tem permissão para deletar este comentário',
                code: 'FORBIDDEN'
            });
        }
        
        // Deletar comentário
        const result = await Comment.delete(commentId);
        
        if (!result.deleted) {
            return res.status(404).json({
                error: 'Comentário não encontrado',
                code: 'COMMENT_NOT_FOUND'
            });
        }
        
        console.log('✅ [COMMENTS] Comentário deletado com sucesso');
        res.json({
            message: 'Comentário deletado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ [COMMENTS] Erro ao deletar comentário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

module.exports = router;
