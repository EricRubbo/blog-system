const { query } = require('../database');

class Post {
    // Criar novo post
    static async create(postData) {
        try {
            const { title, content, author_id, status = 'draft', tags, image } = postData;
            
            console.log('📄 [POST] Criando post:', { title, author_id, status });
            
            const sql = `
                INSERT INTO posts (title, content, author_id, status, tags, image, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            
            const result = await query(sql, [title, content, author_id, status, tags, image]);
            
            if (result.rows.length > 0) {
                console.log('✅ [POST] Post criado com ID:', result.rows[0].id);
                // Buscar o post completo com dados do autor
                return await Post.findById(result.rows[0].id);
            } else {
                throw new Error('Falha ao criar post');
            }
            
        } catch (error) {
            console.error('❌ [POST] Erro ao criar post:', error);
            throw error;
        }
    }

    // Buscar post por ID - INCLUINDO COMENTÁRIOS
    static async findById(id) {
        try {
            console.log('📄 [POST] Buscando post por ID:', id);
            
            const sql = `
                SELECT p.*, u.name as author_name, u.email as author_email
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.id = $1
            `;
            
            const result = await query(sql, [id]);
            
            if (result.rows.length > 0) {
                const post = result.rows[0];
                console.log('✅ [POST] Post encontrado:', { 
                    id: post.id, 
                    title: post.title, 
                    author_id: post.author_id,
                    author_name: post.author_name 
                });
                
                // Buscar comentários do post
                try {
                    const comments = await Post.getCommentsForPost(id);
                    post.comments = comments;
                    console.log('✅ [POST] Comentários incluídos:', comments.length);
                } catch (commentErr) {
                    console.error('❌ [POST] Erro ao buscar comentários:', commentErr);
                    post.comments = [];
                }
                
                return post;
            } else {
                console.log('❌ [POST] Post não encontrado:', id);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [POST] Erro ao buscar post:', error);
            throw error;
        }
    }

    // Método auxiliar para buscar comentários de um post
    static async getCommentsForPost(postId) {
        try {
            console.log('💬 [POST] Buscando comentários para post:', postId);
            
            const sql = `
                SELECT c.*, 
                       COALESCE(u.name, c.author_name) as author_name, 
                       u.avatar as author_avatar
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.post_id = $1 AND c.status = $2
                ORDER BY c.created_at ASC
            `;
            
            const result = await query(sql, [postId, 'approved']);
            
            console.log('✅ [POST] Comentários encontrados:', result.rows.length);
            return result.rows;
            
        } catch (error) {
            console.error('❌ [POST] Erro ao buscar comentários:', error);
            throw error;
        }
    }

    // Buscar posts publicados
    static async findPublished() {
        try {
            console.log('📄 [POST] Buscando posts publicados...');
            
            const sql = `
                SELECT p.*, u.name as author_name
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.status = $1
                ORDER BY p.created_at DESC
            `;
            
            const result = await query(sql, ['published']);
            
            console.log('✅ [POST] Posts publicados encontrados:', result.rows.length);
            return result.rows;
            
        } catch (error) {
            console.error('❌ [POST] Erro ao buscar posts publicados:', error);
            throw error;
        }
    }

    // Buscar posts por autor
    static async findByAuthor(authorId) {
        try {
            console.log('📄 [POST] Buscando posts do autor:', authorId);
            
            const sql = `
                SELECT p.*, u.name as author_name
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.author_id = $1
                ORDER BY p.created_at DESC
            `;
            
            const result = await query(sql, [authorId]);
            
            console.log('✅ [POST] Posts do autor encontrados:', result.rows.length);
            return result.rows;
            
        } catch (error) {
            console.error('❌ [POST] Erro ao buscar posts do autor:', error);
            throw error;
        }
    }

    // Atualizar post
    static async update(id, postData) {
        try {
            const { title, content, status, tags, image } = postData;
            
            console.log('📄 [POST] Atualizando post:', id, 'Dados:', { title, status });
            
            const sql = `
                UPDATE posts 
                SET title = $1, content = $2, status = $3, tags = $4, image = $5, updated_at = CURRENT_TIMESTAMP
                WHERE id = $6
                RETURNING *
            `;
            
            const result = await query(sql, [title, content, status, tags, image, id]);
            
            if (result.rows.length > 0) {
                console.log('✅ [POST] Post atualizado');
                return await Post.findById(id);
            } else {
                console.log('❌ [POST] Post não encontrado para atualização');
                return null;
            }
            
        } catch (error) {
            console.error('❌ [POST] Erro ao atualizar post:', error);
            throw error;
        }
    }

    // Deletar post
    static async delete(id) {
        try {
            console.log('📄 [POST] Deletando post:', id);
            
            const sql = 'DELETE FROM posts WHERE id = $1';
            const result = await query(sql, [id]);
            
            console.log('✅ [POST] Post deletado, linhas afetadas:', result.rowCount);
            return { deleted: result.rowCount > 0 };
            
        } catch (error) {
            console.error('❌ [POST] Erro ao deletar post:', error);
            throw error;
        }
    }

    // Verificar se usuário é autor do post
    static async isAuthor(postId, userId) {
        try {
            console.log('📄 [POST] Verificando autoria - Post:', postId, 'Usuário:', userId);
            
            const sql = 'SELECT author_id FROM posts WHERE id = $1';
            const result = await query(sql, [postId]);
            
            if (result.rows.length > 0) {
                const postAuthorId = Number(result.rows[0].author_id);
                const currentUserId = Number(userId);
                
                const isAuthor = postAuthorId === currentUserId;
                console.log('📄 [POST] É autor?', isAuthor, '(', postAuthorId, '===', currentUserId, ')');
                
                return isAuthor;
            } else {
                console.log('❌ [POST] Post não encontrado para verificação de autoria');
                return false;
            }
            
        } catch (error) {
            console.error('❌ [POST] Erro ao verificar autoria:', error);
            throw error;
        }
    }
}

module.exports = Post;

