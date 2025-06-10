const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Configurar multer para upload de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads');
        
        // Criar pasta se não existir
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Gerar nome único para o arquivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Filtro para tipos de arquivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido. Use apenas: JPEG, PNG, GIF, WebP'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB padrão
    }
});

// Rota para upload de imagem
router.post('/image', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Nenhum arquivo foi enviado',
                code: 'NO_FILE'
            });
        }

        // Construir URL do arquivo
        const fileUrl = `/uploads/${req.file.filename}`;
        
        res.json({
            message: 'Arquivo enviado com sucesso',
            file: {
                filename: req.file.filename,
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                url: fileUrl
            }
        });
        
    } catch (error) {
        console.error('Erro no upload:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            code: 'INTERNAL_ERROR'
        });
    }
});

// Middleware de tratamento de erros do multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'Arquivo muito grande. Tamanho máximo: 5MB',
                code: 'FILE_TOO_LARGE'
            });
        }
        
        return res.status(400).json({
            error: 'Erro no upload: ' + error.message,
            code: 'UPLOAD_ERROR'
        });
    }
    
    if (error.message.includes('Tipo de arquivo não permitido')) {
        return res.status(400).json({
            error: error.message,
            code: 'INVALID_FILE_TYPE'
        });
    }
    
    next(error);
});

module.exports = router;
