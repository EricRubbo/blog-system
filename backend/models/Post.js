const { db } = require('../database');
const Comment = require('./Comment'); // Importar o modelo de comentário

class Post {
    // Criar novo post
    static async create(postData) {
        return new Promise((resolve, reject) => {
            const { title, content, author_id, status = 'draft', tags, image } = postData;
            
            console.log('📄 [POST] Criando post:', { title, author_id, status });
            
            const sql = `
                INSERT INTO posts (title, content, author_id, status, tags, image, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            db.run(sql, [title, content, author_id, status, tags, image], function(err) {
                if (err) {
                    console.error('❌ [POST] Erro ao criar post:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Post criado com ID:', this.lastID);
                    Post.findById(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Buscar post por ID - INCLUINDO COMENTÁRIOS
    static async findById(id) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Buscando post por ID:', id);
            
            const sql = `
                SELECT p.*, u.name as author_name, u.email as author_email
                FROM posts p
                LEFT JOIN users u ON p.author_id = u.id
                WHERE p.id = ?
            `;
            
            db.get(sql, [id], async (err, post) => {
                if (err) {
                    console.error('❌ [POST] Erro ao buscar post:', err);
                    reject(err);
                } else if (post) {
                    console.log('✅ [POST] Post encontrado:', { 
                        id: post.id, 
                        title: post.title, 
                        author_id: post.author_id,
                        author_name: post.author_name 
                    });
                    
                    // Buscar comentários do post
                    try {
                        const comments = await Comment.findByPost(id);
                        post.comments = comments;
                        console.log('✅ [POST] Comentários incluídos:', comments.length);
                    } catch (commentErr) {
                        console.error('❌ [POST] Erro ao buscar comentários:', commentErr);
                        post.comments = [];
                    }
                    
                    resolve(post);
                } else {
                    console.log('❌ [POST] Post não encontrado:', id);
                    resolve(null);
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
                WHERE p.status = ?
                ORDER BY p.created_at DESC
            `;
            
            db.all(sql, ['published'], (err, rows) => {
                if (err) {
                    console.error('❌ [POST] Erro ao buscar posts publicados:', err);
                    reject(err);
                } else {
                    console.log('✅ [POST] Posts publicados encontrados:', rows.length);
                    resolve(rows);
                }
            });
        });
    }

    // Buscar posts por autor
    static async findByAuthor(authorId) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Buscando posts do autor:', authorId);
            
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
                    resolve(rows);
                }
            });
        });
    }

    // Atualizar post
    static async update(id, postData) {
        return new Promise((resolve, reject) => {
            const { title, content, status, tags, image } = postData;
            
            console.log('📄 [POST] Atualizando post:', id, 'Dados:', { title, status });
            
            const sql = `
                UPDATE posts 
                SET title = ?, content = ?, status = ?, tags = ?, image = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            
            db.run(sql, [title, content, status, tags, image, id], function(err) {
                if (err) {
                    console.error('❌ [POST] Erro ao atualizar post:', err);
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        console.log('✅ [POST] Post atualizado');
                        Post.findById(id)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        console.log('❌ [POST] Post não encontrado para atualização');
                        resolve(null);
                    }
                }
            });
        });
    }

    // Deletar post
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

    // Verificar se usuário é autor do post
    static async isAuthor(postId, userId) {
        return new Promise((resolve, reject) => {
            console.log('📄 [POST] Verificando autoria - Post:', postId, 'Usuário:', userId);
            
            const sql = 'SELECT author_id FROM posts WHERE id = ?';
            db.get(sql, [postId], (err, row) => {
                if (err) {
                    console.error('❌ [POST] Erro ao verificar autoria:', err);
                    reject(err);
                } else if (row) {
                    const isAuthor = row.author_id === userId;
                    console.log('📄 [POST] É autor?', isAuthor);
                    resolve(isAuthor);
                } else {
                    console.log('❌ [POST] Post não encontrado para verificação de autoria');
                    resolve(false);
                }
            });
        });
    }
}

module.exports = Post;
