const bcrypt = require('bcryptjs');
const { db } = require('../database');

class User {
    // Buscar usuário por ID (com logs detalhados)
    static async findById(id) {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Buscando usuário por ID:', id);
            console.log('👤 [USER] Tipo do ID:', typeof id);
            
            const sql = 'SELECT * FROM users WHERE id = ?';
            
            db.get(sql, [id], (err, row) => {
                if (err) {
                    console.error('❌ [USER] Erro ao buscar usuário por ID:', err);
                    reject(err);
                } else {
                    console.log('👤 [USER] Resultado da busca:', row ? 'Usuário encontrado' : 'Usuário não encontrado');
                    if (row) {
                        console.log('👤 [USER] Dados do usuário:', { id: row.id, name: row.name, email: row.email });
                    }
                    resolve(row || null);
                }
            });
        });
    }

    // Criar novo usuário
    static async create(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('👤 [USER] Criando novo usuário:', userData.email);
                const { name, email, password } = userData;
                
                // Hash da senha
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(password, saltRounds);
                
                const sql = `
                    INSERT INTO users (name, email, password, created_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
                `;
                
                db.run(sql, [name, email, hashedPassword], function(err) {
                    if (err) {
                        console.error('❌ [USER] Erro ao criar usuário:', err);
                        reject(err);
                    } else {
                        console.log('✅ [USER] Usuário criado com ID:', this.lastID);
                        resolve({
                            id: this.lastID,
                            name,
                            email,
                            created_at: new Date().toISOString()
                        });
                    }
                });
            } catch (error) {
                console.error('❌ [USER] Erro no hash da senha:', error);
                reject(error);
            }
        });
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Buscando usuário por email:', email);
            const sql = 'SELECT * FROM users WHERE email = ?';
            
            db.get(sql, [email], (err, row) => {
                if (err) {
                    console.error('❌ [USER] Erro ao buscar usuário por email:', err);
                    reject(err);
                } else {
                    console.log('👤 [USER] Resultado da busca por email:', row ? 'Encontrado' : 'Não encontrado');
                    resolve(row || null);
                }
            });
        });
    }

    // Listar todos os usuários (para debug)
    static async listAll() {
        return new Promise((resolve, reject) => {
            console.log('👤 [USER] Listando todos os usuários...');
            const sql = 'SELECT id, name, email, created_at FROM users';
            
            db.all(sql, [], (err, rows) => {
                if (err) {
                    console.error('❌ [USER] Erro ao listar usuários:', err);
                    reject(err);
                } else {
                    console.log('👤 [USER] Total de usuários encontrados:', rows.length);
                    rows.forEach(user => {
                        console.log('👤 [USER] -', { id: user.id, name: user.name, email: user.email });
                    });
                    resolve(rows || []);
                }
            });
        });
    }

    // Outros métodos...
    static async update(id, userData) {
        return new Promise((resolve, reject) => {
            const { name, email, avatar } = userData;
            
            const sql = `
                UPDATE users 
                SET name = ?, email = ?, avatar = ?
                WHERE id = ?
            `;
            
            db.run(sql, [name, email, avatar, id], function(err) {
                if (err) {
                    console.error('Erro ao atualizar usuário:', err);
                    reject(err);
                } else {
                    if (this.changes === 0) {
                        resolve(null);
                    } else {
                        User.findById(id)
                            .then(user => resolve(user))
                            .catch(err => reject(err));
                    }
                }
            });
        });
    }
}

module.exports = User;
