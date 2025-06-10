const { db } = require('../database');

class Post {
    // Criar novo post
    static async create(postData) {
        return new Promise((resolve, reject) => {
            const { title, content, author_id, status = 'draft', tags, image } = postData;
            
            console.log('📄 [POST] Criando post:', { title, author_id, status });
            
            const sql = `
                INSERT INTO posts (title, content, author_id, status, tags, image, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `;
            
            db.run(sql, [title, content, author_id, status, tags, image], function(err) {
                if (err) {
                    console.error('❌ [POST] Erro ao criar post:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Post criado com ID:', this.lastID);
                    Post.findById(this.lastID)
                        .then(post => resolve(post))
                        .catch(err => reject(err));
                }
            });
        });
    }

    // Buscar post por ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Buscando post por ID:', id);
            
            const sql = `
                SELECT p.*, u.name as author_name, u.email as author_email
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.id = ?
            `;
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('❌ [POST] Erro ao buscar post:', err);
                    reject(err);
                } else {
                    if (row) {
                        console.log('✅ [POST] Post encontrado:', { 
                            id: row.id, 
                            title: row.title, 
                            author_id: row.author_id,
                            author_name: row.author_name 
                        });
                    } else {
                        console.log('❌ [POST] Post não encontrado:', id);
                    }
                    resolve(row || null);
                }
            });
        });
    }

    // Buscar posts publicados
    static async findPublished() {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Buscando posts publicados...');
            
            const sql = `
                SELECT p.*, u.name as author_name
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.status = 'published'
                ORDER BY p.created_at DESC
            `;
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('❌ [POST] Erro ao buscar posts publicados:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Posts publicados encontrados:', rows.length);
                    resolve(rows || []);
                }
            });
        });
    }

    // Buscar posts por autor - CORRIGIDO
    static async findByAuthor(authorId) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Buscando posts do autor:', authorId, 'Tipo:', typeof authorId);
            
            const sql = `
                SELECT p.*, u.name as author_name
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.author_id = ?
                ORDER BY p.created_at DESC
            `;
            
            db.all(sql, [authorId], (err, rows) => {
                if (err) {
                    console.error('❌ [POST] Erro ao buscar posts do autor:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Posts do autor encontrados:', rows.length);
                    rows.forEach(post => {
                        console.log('📄 [POST] -', { 
                            id: post.id, 
                            title: post.title, 
                            author_id: post.author_id,
                            status: post.status 
                        });
                    });
                    resolve(rows || []);
                }
            });
        });
    }

    // Atualizar post - CORRIGIDO
    static async update(id, postData) {
        return new Promise((resolve, reject) => {
            const { title, content, status, tags, image } = postData;
            
            console.log('📄 [POST] Atualizando post:', id, 'Dados:', { title, status });
            
            const sql = `
                UPDATE posts 
                SET title = ?, content = ?, status = ?, tags = ?, image = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(sql, [title, content, status, tags, image, id], function(err) {
                if (err) {
                    console.error('❌ [POST] Erro ao atualizar post:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Post atualizado, linhas afetadas:', this.changes);
                    if (this.changes === 0) {
                        resolve(null);
                    } else {
                        Post.findById(id)
                            .then(post => resolve(post))
                            .catch(err => reject(err));
                    }
                }
            });
        });
    }

    // Deletar post - CORRIGIDO
    static async delete(id) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Deletando post:', id);
            
            const sql = 'DELETE FROM posts WHERE id = ?';
            
            db.run(sql, [id], function(err) {
                if (err) {
                    console.error('❌ [POST] Erro ao deletar post:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Post deletado, linhas afetadas:', this.changes);
                    resolve({ deleted: this.changes > 0 });
                }
            });
        });
    }

    // Verificar se usuário é autor do post - CORRIGIDO
    static async isAuthor(postId, userId) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Verificando autoria - Post:', postId, 'Usuário:', userId);
            console.log('📄 [POST] Tipos - Post:', typeof postId, 'Usuário:', typeof userId);
            
            const sql = 'SELECT author_id FROM posts WHERE id = ?';
            
            db.get(sql, [postId], (err, row) => {
                if (err) {
                    console.error('❌ [POST] Erro ao verificar autoria:', err);
                    reject(err);
                } else {
                    if (row) {
                        console.log('📄 [POST] Author_id do post:', row.author_id, 'Tipo:', typeof row.author_id);
                        console.log('📄 [POST] User_id comparando:', userId, 'Tipo:', typeof userId);
                        
                        // Converter ambos para number para comparação segura
                        const postAuthorId = Number(row.author_id);
                        const currentUserId = Number(userId);
                        
                        const isAuthor = postAuthorId === currentUserId;
                        console.log('📄 [POST] É autor?', isAuthor, '(', postAuthorId, '===', currentUserId, ')');
                        
                        resolve(isAuthor);
                    } else {
                        console.log('❌ [POST] Post não encontrado para verificação de autoria');
                        resolve(false);
                    }
                }
            });
        });
    }
}

module.exports = Post;
