const { query } = require('../database');

class Comment {
    // Criar novo comentário
    static async create(commentData) {
        try {
            const { post_id, author_id, author_name, content } = commentData;
            
            console.log('💬 [COMMENT] Criando comentário:', { post_id, author_id, author_name });
            
            const sql = `
                INSERT INTO comments (post_id, author_id, author_name, content, status, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING *
            `;
            
            const result = await query(sql, [post_id, author_id, author_name, content, 'approved']);
            
            if (result.rows.length > 0) {
                console.log('✅ [COMMENT] Comentário criado com ID:', result.rows[0].id);
                return await Comment.findById(result.rows[0].id);
            } else {
                throw new Error('Falha ao criar comentário');
            }
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao criar comentário:', error);
            throw error;
        }
    }

    // Buscar comentário por ID
    static async findById(id) {
        try {
            console.log('💬 [COMMENT] Buscando comentário por ID:', id);
            
            const sql = `
                SELECT c.*, COALESCE(u.name, c.author_name) as author_name
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.id = $1
            `;
            
            const result = await query(sql, [id]);
            
            if (result.rows.length > 0) {
                console.log('✅ [COMMENT] Comentário encontrado:', result.rows[0].id);
                return result.rows[0];
            } else {
                console.log('❌ [COMMENT] Comentário não encontrado:', id);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao buscar comentário:', error);
            throw error;
        }
    }

    // Buscar comentários por post
    static async findByPost(postId) {
        try {
            console.log('💬 [COMMENT] Buscando comentários do post:', postId);
            
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
            
            console.log('✅ [COMMENT] Comentários encontrados:', result.rows.length);
            return result.rows;
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao buscar comentários do post:', error);
            throw error;
        }
    }

    // Atualizar comentário
    static async update(id, commentData) {
        try {
            const { content, status } = commentData;
            
            console.log('💬 [COMMENT] Atualizando comentário:', id);
            
            const sql = `
                UPDATE comments 
                SET content = $1, status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;
            
            const result = await query(sql, [content, status, id]);
            
            if (result.rows.length > 0) {
                console.log('✅ [COMMENT] Comentário atualizado');
                return { updated: true, comment: result.rows[0] };
            } else {
                console.log('❌ [COMMENT] Comentário não encontrado para atualização');
                return { updated: false };
            }
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao atualizar comentário:', error);
            throw error;
        }
    }

    // Deletar comentário
    static async delete(id) {
        try {
            console.log('💬 [COMMENT] Deletando comentário:', id);
            
            const sql = 'DELETE FROM comments WHERE id = $1';
            const result = await query(sql, [id]);
            
            console.log('✅ [COMMENT] Comentário deletado, linhas afetadas:', result.rowCount);
            return { deleted: result.rowCount > 0 };
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao deletar comentário:', error);
            throw error;
        }
    }

    // Verificar se usuário é autor do comentário
    static async isAuthor(commentId, userId) {
        try {
            console.log('💬 [COMMENT] Verificando autoria - Comentário:', commentId, 'Usuário:', userId);
            
            const sql = 'SELECT author_id FROM comments WHERE id = $1';
            const result = await query(sql, [commentId]);
            
            if (result.rows.length > 0) {
                const commentAuthorId = Number(result.rows[0].author_id);
                const currentUserId = Number(userId);
                
                const isAuthor = commentAuthorId === currentUserId;
                console.log('💬 [COMMENT] É autor?', isAuthor);
                
                return isAuthor;
            } else {
                console.log('❌ [COMMENT] Comentário não encontrado para verificação de autoria');
                return false;
            }
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao verificar autoria do comentário:', error);
            throw error;
        }
    }

    // Contar comentários por post
    static async countByPost(postId) {
        try {
            console.log('💬 [COMMENT] Contando comentários do post:', postId);
            
            const sql = `
                SELECT COUNT(*) as count 
                FROM comments 
                WHERE post_id = $1 AND status = $2
            `;
            
            const result = await query(sql, [postId, 'approved']);
            
            const count = parseInt(result.rows[0].count);
            console.log('✅ [COMMENT] Total de comentários:', count);
            
            return count;
            
        } catch (error) {
            console.error('❌ [COMMENT] Erro ao contar comentários:', error);
            throw error;
        }
    }
}

module.exports = Comment;
