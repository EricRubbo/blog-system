const { db } = require('../database');

class Comment {
    // Criar novo comentário
    static async create(commentData) {
        return new Promise((resolve, reject) => {
            const { post_id, author_id, author_name, content } = commentData;
            
            const sql = `
                INSERT INTO comments (post_id, author_id, author_name, content, status, created_at)
                VALUES (?, ?, ?, ?, 'approved', CURRENT_TIMESTAMP)
            `;
            
            db.run(sql, [post_id, author_id, author_name, content], function(err) {
                if (err) {
                    console.error('Erro ao criar comentário:', err);
                    reject(err);
                } else {
                    // Buscar o comentário criado
                    Comment.findById(this.lastID)
                        .then(comment => resolve(comment))
                        .catch(err => reject(err));
                }
            });
        });
    }

    // Buscar comentário por ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c.*, COALESCE(u.name, c.author_name) as author_name
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('Erro ao buscar comentário:', err);
                    reject(err);
                } else {
                    resolve(row || null);
                }
            });
        });
    }

    // Buscar comentários por post
    static async findByPost(postId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT c.*, 
                       COALESCE(u.name, c.author_name) as author_name, 
                       u.avatar as author_avatar
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.post_id = ? AND c.status = 'approved'
                ORDER BY c.created_at ASC
            `;
            
            db.all(sql, [postId], (err, rows) => {
                if (err) {
                    console.error('Erro ao buscar comentários do post:', err);
                    reject(err);
                } else {
                    resolve(rows || []);
                }
            });
        });
    }

    // Atualizar comentário
    static async update(id, commentData) {
        return new Promise((resolve, reject) => {
            const { content, status } = commentData;
            
            const sql = `
                UPDATE comments 
                SET content = ?, status = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [content, status, id], function(err) {
                if (err) {
                    console.error('Erro ao atualizar comentário:', err);
                    reject(err);
                } else {
                    if (this.changes === 0) {
                        resolve({ updated: false });
                    } else {
                        Comment.findById(id)
                            .then(comment => resolve({ updated: true, comment }))
                            .catch(err => reject(err));
                    }
                }
            });
        });
    }

    // Deletar comentário
    static async delete(id) {
        return new Promise((resolve, reject) => {
            const sql = 'DELETE FROM comments WHERE id = ?';
            
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error('Erro ao deletar comentário:', err);
                    reject(err);
                } else {
                    resolve({ deleted: this.changes > 0 });
                }
            });
        });
    }

    // Verificar se usuário é autor do comentário
    static async isAuthor(commentId, userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT author_id FROM comments WHERE id = ?';
            
            db.get(sql, [commentId], (err, row) => {
                if (err) {
                    console.error('Erro ao verificar autoria do comentário:', err);
                    reject(err);
                } else {
                    resolve(row && row.author_id === userId);
                }
            });
        });
    }

    // Contar comentários por post
    static async countByPost(postId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT COUNT(*) as count 
                FROM comments 
                WHERE post_id = ? AND status = 'approved'
            `;
            
            db.get(sql, [postId], (err, row) => {
                if (err) {
                    console.error('Erro ao contar comentários:', err);
                    reject(err);
                } else {
                    resolve(row ? row.count : 0);
                }
            });
        });
    }
}

module.exports = Comment;
