const express = require('express');
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
        console.log('✅ [COMMENTS] Comentários encontrados:', comments.length);

        const count = await Comment.countByPost(postId);
        console.log('💬 [COMMENTS] Total de comentários:', count);

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
        console.log('💬 [COMMENTS] Verificando se post existe e está publicado...');
        const post = await Post.findById(postId);

        if (!post) {
            console.log('❌ [COMMENTS] Post não encontrado:', postId);
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }

        if (post.status !== 'published') {
            console.log('❌ [COMMENTS] Post não está publicado:', post.status);
            return res.status(403).json({
                error: 'Não é possível comentar em posts não publicados',
                code: 'POST_NOT_PUBLISHED'
            });
        }

        // Criar comentário
        console.log('💬 [COMMENTS] Criando comentário no banco...');
        console.log('💬 [COMMENTS] Dados de entrada:', {
            postId,
            authorId: req.user.id,
            authorName: req.user.name,
            content
        });

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
        // TRATAMENTO DE ERRO DETALHADO
        console.error('❌ [COMMENTS] ERRO FATAL AO CRIAR COMENTÁRIO:', error.message, error.stack);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message, // <-- ADICIONADO PARA DEBUG
            code: 'INTERNAL_ERROR'
        });
    }
});

// Rota de debug para listar todos os comentários
router.get('/debug/comments', async (req, res) => {
    try {
        const sql = 'SELECT * FROM comments';
        db.all(sql, (err, rows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json(rows);
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
