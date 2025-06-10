const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validações para posts
const postValidation = [
    body('title')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Título deve ter entre 1 e 200 caracteres'),
    body('content')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Conteúdo é obrigatório')
];

// Buscar posts públicos (sem autenticação)
router.get('/', async (req, res) => {
    try {
        console.log('📄 [POSTS] Buscando posts públicos...');
        const posts = await Post.findPublished();
        console.log('📄 [POSTS] Posts públicos encontrados:', posts.length);
        
        res.json({
            posts,
            count: posts.length
        });
    } catch (error) {
        console.error('❌ [POSTS] Erro ao buscar posts públicos:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Buscar meus posts (com autenticação)
router.get('/my', authenticateToken, async (req, res) => {
    try {
        console.log('📄 [POSTS] Buscando posts do usuário:', req.user.id);
        
        // Buscar posts do usuário logado
        const posts = await Post.findByAuthor(req.user.id);
        console.log('📄 [POSTS] Posts do usuário encontrados:', posts.length);
        
        // Contar posts por status
        const published = posts.filter(post => post.status === 'published').length;
        const drafts = posts.filter(post => post.status === 'draft').length;
        
        console.log('📄 [POSTS] Publicados:', published, 'Rascunhos:', drafts);
        
        res.json({
            posts,
            count: posts.length,
            published,
            drafts,
            stats: {
                total: posts.length,
                published,
                drafts
            }
        });
    } catch (error) {
        console.error('❌ [POSTS] Erro ao buscar posts do usuário:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Buscar post específico por ID
router.get('/:id', async (req, res) => {
    try {
        console.log('📄 [POSTS] Buscando post por ID:', req.params.id);
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        const post = await Post.findById(postId);
        
        if (!post) {
            console.log('❌ [POSTS] Post não encontrado:', postId);
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        
        console.log('✅ [POSTS] Post encontrado:', post.title);
        res.json({ post });
        
    } catch (error) {
        console.error('❌ [POSTS] Erro ao buscar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Criar novo post
router.post('/', authenticateToken, postValidation, async (req, res) => {
    try {
        console.log('📄 [POSTS] Criando novo post...');
        
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.log('❌ [POSTS] Erros de validação:', errors.array());
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const { title, content, status = 'draft', tags, image } = req.body;
        
        console.log('📄 [POSTS] Dados do post:', { title, status, author: req.user.id });
        
        // Criar post
        const post = await Post.create({
            title,
            content,
            author_id: req.user.id,
            status,
            tags,
            image
        });
        
        console.log('✅ [POSTS] Post criado com sucesso:', post.id);
        
        res.status(201).json({
            message: 'Post criado com sucesso',
            post
        });
        
    } catch (error) {
        console.error('❌ [POSTS] Erro ao criar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Atualizar post - VERSÃO CORRIGIDA
router.put('/:id', authenticateToken, postValidation, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        // Verificar se o post existe
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        
        // Verificar autoria - CORRIGIDO
        console.log('📄 [POSTS] PUT - Verificando autoria - Post author_id:', existingPost.author_id, 'User ID:', req.user.id);
        console.log('📄 [POSTS] PUT - Tipos - Post author_id:', typeof existingPost.author_id, 'User ID:', typeof req.user.id);
        
        // Converter para números para comparação segura
        const postAuthorId = Number(existingPost.author_id);
        const currentUserId = Number(req.user.id);
        
        if (postAuthorId !== currentUserId) {
            console.log('❌ [POSTS] PUT - Usuário não é autor - Post author_id:', postAuthorId, 'User ID:', currentUserId);
            return res.status(403).json({
                error: 'Você não tem permissão para editar este post',
                code: 'FORBIDDEN'
            });
        }
        
        console.log('✅ [POSTS] PUT - Usuário é autor, permitindo edição');
        
        // Verificar erros de validação
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Dados inválidos',
                details: errors.array()
            });
        }
        
        const { title, content, status, tags, image } = req.body;
        
        // Atualizar post
        const updatedPost = await Post.update(postId, {
            title,
            content,
            status,
            tags,
            image
        });
        
        res.json({
            message: 'Post atualizado com sucesso',
            post: updatedPost
        });
        
    } catch (error) {
        console.error('❌ [POSTS] Erro ao atualizar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Deletar post - VERSÃO COM LOGS
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        // Verificar se o post existe
        const existingPost = await Post.findById(postId);
        if (!existingPost) {
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        
        // Verificar autoria com logs
        console.log('📄 [POSTS] DELETE - Verificando autoria - Post author_id:', existingPost.author_id, 'User ID:', req.user.id);
        console.log('📄 [POSTS] DELETE - Tipos - Post author_id:', typeof existingPost.author_id, 'User ID:', typeof req.user.id);
        
        // Converter para números para comparação segura
        const postAuthorId = Number(existingPost.author_id);
        const currentUserId = Number(req.user.id);
        
        if (postAuthorId !== currentUserId) {
            console.log('❌ [POSTS] DELETE - Usuário não é autor - Post author_id:', postAuthorId, 'User ID:', currentUserId);
            return res.status(403).json({
                error: 'Você não tem permissão para deletar este post',
                code: 'FORBIDDEN'
            });
        }
        
        console.log('✅ [POSTS] DELETE - Usuário é autor, permitindo exclusão');
        
        // Deletar post
        await Post.delete(postId);
        
        res.json({
            message: 'Post deletado com sucesso'
        });
        
    } catch (error) {
        console.error('❌ [POSTS] Erro ao deletar post:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});
// Obter post específico do usuário (incluindo rascunhos)
router.get('/my/:id', authenticateToken, async (req, res) => {
    try {
        const postId = parseInt(req.params.id);
        
        if (isNaN(postId)) {
            return res.status(400).json({
                error: 'ID do post inválido',
                code: 'INVALID_POST_ID'
            });
        }
        
        const post = await Post.findById(postId);
        
        if (!post) {
            return res.status(404).json({
                error: 'Post não encontrado',
                code: 'POST_NOT_FOUND'
            });
        }
        
        // Verificar se o usuário é o autor
        const postAuthorId = Number(post.author_id);
        const currentUserId = Number(req.user.id);
        
        console.log('🔍 [MY POST] Verificação:', {
            postAuthorId,
            currentUserId,
            isEqual: postAuthorId === currentUserId
        });
        
        if (postAuthorId !== currentUserId) {
            return res.status(403).json({
                error: 'Você não tem permissão para ver este post',
                code: 'FORBIDDEN'
            });
        }
        
        res.json({ post });
        
    } catch (error) {
        console.error('❌ [MY POST] Erro:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});


module.exports = router;
