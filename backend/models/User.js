const { db } = require('../database');

class User {
    // Criar novo usuário
    static async create(userData) {
        return new Promise((resolve, reject) => {
            const { name, email, password } = userData;
            
            console.log('👤 [USER] Criando usuário:', { name, email });
            
            const sql = `
                INSERT INTO users (name, email, password, created_at, updated_at)
                VALUES (?, ?, ?, datetime('now'), datetime('now'))
            `;
            
            db.run(sql, [name, email, password], function(err) {
                if (err) {
                    console.error('❌ [USER] Erro ao criar usuário:', err);
                    reject(err);
                } else {
                    console.log('✅ [USER] Usuário criado com ID:', this.lastID);
                    User.findById(this.lastID)
                        .then(resolve)
                        .catch(reject);
                }
            });
        });
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Buscando usuário por email:', email);
            
            const sql = 'SELECT * FROM users WHERE email = ? AND status = ?';
            db.get(sql, [email, 'active'], (err, row) => {
                if (err) {
                    console.error('❌ [USER] Erro ao buscar usuário por email:', err);
                    reject(err);
                } else {
                    if (row) {
                        console.log('✅ [USER] Usuário encontrado:', { 
                            id: row.id, 
                            name: row.name 
                        });
                    } else {
                        console.log('❌ [USER] Usuário não encontrado:', email);
                    }
                    resolve(row);
                }
            });
        });
    }

    // Buscar usuário por ID
    static async findById(id) {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Buscando usuário por ID:', id);
            
            const sql = 'SELECT id, name, email, avatar, bio, role, status, created_at FROM users WHERE id = ?';
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('❌ [USER] Erro ao buscar usuário por ID:', err);
                    reject(err);
                } else {
                    if (row) {
                        console.log('✅ [USER] Usuário encontrado:', { 
                            id: row.id, 
                            name: row.name 
                        });
                    } else {
                        console.log('❌ [USER] Usuário não encontrado:', id);
                    }
                    resolve(row);
                }
            });
        });
    }

    // Atualizar usuário
    static async update(id, userData) {
        return new Promise((resolve, reject) => {
            const { name, email, avatar, bio } = userData;
            
            console.log('👤 [USER] Atualizando usuário:', id, { name, email });
            
            const sql = `
                UPDATE users 
                SET name = ?, email = ?, avatar = ?, bio = ?, updated_at = datetime('now')
                WHERE id = ?
            `;
            
            db.run(sql, [name, email, avatar, bio, id], function(err) {
                if (err) {
                    console.error('❌ [USER] Erro ao atualizar usuário:', err);
                    reject(err);
                } else {
                    if (this.changes > 0) {
                        console.log('✅ [USER] Usuário atualizado');
                        User.findById(id)
                            .then(resolve)
                            .catch(reject);
                    } else {
                        console.log('❌ [USER] Usuário não encontrado para atualização');
                        resolve(null);
                    }
                }
            });
        });
    }

    // Verificar se email já existe
    static async emailExists(email, excludeId = null) {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Verificando se email existe:', email);
            
            let sql = 'SELECT id FROM users WHERE email = ?';
            let params = [email];
            
            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }
            
            db.get(sql, params, (err, row) => {
                if (err) {
                    console.error('❌ [USER] Erro ao verificar email:', err);
                    reject(err);
                } else {
                    const exists = !!row;
                    console.log('👤 [USER] Email existe?', exists);
                    resolve(exists);
                }
            });
        });
    }
}

module.exports = User;
