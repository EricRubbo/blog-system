const { db } = require('../database');

class Comment {
    // Criar novo comentário
    static async create(commentData) {
        return new Promise((resolve, reject) => {
            const { post_id, author_id, author_name, content } = commentData;
            
            console.log('💬 [COMMENT] Criando comentário:', { post_id, author_id });
            
            const sql = `
                INSERT INTO comments (post_id, author_id, author_name, content, created_at, updated_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            db.run(sql, [post_id, author_id, author_name, content], function(err) {
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
            const sql = 'SELECT * FROM comments WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
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
                SELECT c.*, u.name as author_name 
                FROM comments c
                LEFT JOIN users u ON c.author_id = u.id
                WHERE c.post_id = ? AND c.status = ?
                ORDER BY c.created_at DESC
            `;
            
            db.all(sql, [postId, 'approved'], (err, rows) => {
                if (err) {
                    console.error('❌ [COMMENT] Erro ao buscar comentários:', err);
                    reject(err);
                } else {
                    console.log('✅ [COMMENT] Comentários encontrados:', rows.length);
                    resolve(rows);
                }
            });
        });
    }

    // Verificar autoria do comentário
    static async isAuthor(commentId, userId) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT id FROM comments WHERE id = ? AND author_id = ?';
            db.get(sql, [commentId, userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(!!row);
                }
            });
        });
    }

    // Contar comentários por post
    static async countByPost(postId) {
        return new Promise((resolve, reject) => {
            console.log('💬 [COMMENT] Contando comentários do post:', postId);
            
            const sql = 'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND status = ?';
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
