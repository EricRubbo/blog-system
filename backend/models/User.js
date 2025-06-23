const { query } = require('../database');

class User {
    // Criar novo usuário
    static async create(userData) {
        try {
            const { name, email, password } = userData;
            
            console.log('👤 [USER] Criando usuário:', { name, email });
            
            const sql = `
                INSERT INTO users (name, email, password, created_at, updated_at)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                RETURNING id, name, email, role, status, created_at
            `;
            
            const result = await query(sql, [name, email, password]);
            
            if (result.rows.length > 0) {
                console.log('✅ [USER] Usuário criado com ID:', result.rows[0].id);
                return result.rows[0];
            } else {
                throw new Error('Falha ao criar usuário');
            }
            
        } catch (error) {
            console.error('❌ [USER] Erro ao criar usuário:', error);
            throw error;
        }
    }

    // Buscar usuário por email
    static async findByEmail(email) {
        try {
            console.log('👤 [USER] Buscando usuário por email:', email);
            
            const sql = 'SELECT * FROM users WHERE email = $1 AND status = $2';
            const result = await query(sql, [email, 'active']);
            
            if (result.rows.length > 0) {
                console.log('✅ [USER] Usuário encontrado:', { 
                    id: result.rows[0].id, 
                    name: result.rows[0].name 
                });
                return result.rows[0];
            } else {
                console.log('❌ [USER] Usuário não encontrado:', email);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [USER] Erro ao buscar usuário por email:', error);
            throw error;
        }
    }

    // Buscar usuário por ID
    static async findById(id) {
        try {
            console.log('👤 [USER] Buscando usuário por ID:', id);
            
            const sql = 'SELECT id, name, email, avatar, bio, role, status, created_at FROM users WHERE id = $1';
            const result = await query(sql, [id]);
            
            if (result.rows.length > 0) {
                console.log('✅ [USER] Usuário encontrado:', { 
                    id: result.rows[0].id, 
                    name: result.rows[0].name 
                });
                return result.rows[0];
            } else {
                console.log('❌ [USER] Usuário não encontrado:', id);
                return null;
            }
            
        } catch (error) {
            console.error('❌ [USER] Erro ao buscar usuário por ID:', error);
            throw error;
        }
    }

    // Atualizar usuário
    static async update(id, userData) {
        try {
            const { name, email, avatar, bio } = userData;
            
            console.log('👤 [USER] Atualizando usuário:', id, { name, email });
            
            const sql = `
                UPDATE users 
                SET name = $1, email = $2, avatar = $3, bio = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id = $5
                RETURNING id, name, email, avatar, bio, role, status, created_at, updated_at
            `;
            
            const result = await query(sql, [name, email, avatar, bio, id]);
            
            if (result.rows.length > 0) {
                console.log('✅ [USER] Usuário atualizado');
                return result.rows[0];
            } else {
                console.log('❌ [USER] Usuário não encontrado para atualização');
                return null;
            }
            
        } catch (error) {
            console.error('❌ [USER] Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    // Verificar se email já existe
    static async emailExists(email, excludeId = null) {
        try {
            console.log('👤 [USER] Verificando se email existe:', email);
            
            let sql = 'SELECT id FROM users WHERE email = $1';
            let params = [email];
            
            if (excludeId) {
                sql += ' AND id != $2';
                params.push(excludeId);
            }
            
            const result = await query(sql, params);
            
            const exists = result.rows.length > 0;
            console.log('👤 [USER] Email existe?', exists);
            
            return exists;
            
        } catch (error) {
            console.error('❌ [USER] Erro ao verificar email:', error);
            throw error;
        }
    }
}

module.exports = User;

