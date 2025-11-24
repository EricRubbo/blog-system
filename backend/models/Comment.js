const { db } = require('../database');

class Comment {
    // Criar novo comentário
    static async create(commentData) {
        return new Promise((resolve, reject) => {
            const { post_id, author_id, author_name, content } = commentData;
            
            console.log('💬 [COMMENT] Criando comentário:', { post_id, author_id, author_name });
            
            const sql = `
                INSERT INTO comments (post_id, author_id, author_name, content, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            db.run(sql, [post_id, author_id, author_name, content, 'approved'], function(err) {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao criar comentário:', err);
                    reject(err);
                } else {
                    console.log('✅ [COMMENT] Comentário criado com ID:', this.lastID);
                    Comment.findById(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Buscar comentário por ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Buscando comentário por ID:', id);
            
            const sql = `
                SELECT c.*, u.name as author_name
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao buscar comentário:', err);
                    reject(err);
                } else {
                    if (row) {
                        console.log('✅ [COMMENT] Comentário encontrado:', row.id);
                    } else {
                        console.log('❌ [COMMENT] Comentário não encontrado:', id);
                    }
                    resolve(row);
                }
            });
        });
    }

    // Buscar comentários por post
    static async findByPost(postId) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Buscando comentários do post:', postId);
            
            const sql = `
                SELECT c.*, 
                       COALESCE(u.name, c.author_name) as author_name, 
                       u.avatar as author_avatar
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.post_id = ? AND c.status = ?
                ORDER BY c.created_at ASC
            `;
            
            db.all(sql, [postId, 'approved'], (err, rows) => {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao buscar comentários do post:', err);
                    reject(err);
                } else {
                    console.log('✅ [COMMENT] Comentários encontrados:', rows.length);
                    resolve(rows);
                }
            });
        });
    }

    // Atualizar comentário
    static async update(id, commentData) {
        return new Promise((resolve, reject) => {
            const { content, status } = commentData;
            
            console.log('💬 [COMMENT] Atualizando comentário:', id);
            
            const sql = `
                UPDATE comments 
                SET content = ?, status = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            
            db.run(sql, [content, status, id], function(err) {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao atualizar comentário:', err);
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        console.log('✅ [COMMENT] Comentário atualizado');
                        Comment.findById(id)
                            .then(comment => resolve({ updated: true, comment }))
                            .catch(reject);
                    } else {
                        console.log('❌ [COMMENT] Comentário não encontrado para atualização');
                        resolve({ updated: false });
                    }
                }
            });
        });
    }

    // Deletar comentário
    static async delete(id) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Deletando comentário:', id);
            
            const sql = 'DELETE FROM comments WHERE id = ?';
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao deletar comentário:', err);
                    reject(err);
                } else {
                    console.log('✅ [COMMENT] Comentário deletado, linhas afetadas:', this.changes);
                    resolve({ deleted: this.changes > 0 });
                }
            });
        });
    }

    // Verificar se usuário é autor do comentário
    static async isAuthor(commentId, userId) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Verificando autoria - Comentário:', commentId, 'Usuário:', userId);
            
            const sql = 'SELECT author_id FROM comments WHERE id = ?';
            db.get(sql, [commentId], (err, row) => {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao verificar autoria do comentário:', err);
                    reject(err);
                } else if (row) {
                    const isAuthor = row.author_id === userId;
                    console.log('💬 [COMMENT] É autor?', isAuthor);
                    resolve(isAuthor);
                } else {
                    console.log('❌ [COMMENT] Comentário não encontrado para verificação de autoria');
                    resolve(false);
                }
            });
        });
    }

    // Contar comentários por post
    static async countByPost(postId) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Contando comentários do post:', postId);
            
            const sql = `
                SELECT COUNT(*) as count 
                FROM comments 
                WHERE post_id = ? AND status = ?
            `;
            
            db.get(sql, [postId, 'approved'], (err, row) => {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao contar comentários:', err);
                    reject(err);
                } else {
                    const count = row ? row.count : 0;
                    console.log('✅ [COMMENT] Total de comentários:', count);
                    resolve(count);
                }
            });
        });
    }
}

module.exports = Comment;
