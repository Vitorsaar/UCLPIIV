const MediaFile = require('../models/mediaFile');
const multer = require('multer');
const path = require('path');

// Configurar o multer para upload de imagens e vídeos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|mp4|mkv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Erro: Somente imagens e vídeos permitidos.');
        }
    }
}).single('media');

// Função para upload de mídia
const uploadMedia = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send(err);
        }
        try {
            const media = new MediaFile({
                type: req.file.mimetype.includes('image') ? 'image' : 'video',
                url: req.file.path,
            });
            await media.save();
            res.status(201).json(media);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao salvar a mídia.' });
        }
    });
};

// Função para adicionar texto como mídia
const addTextMedia = async (req, res) => {
    try {
        const media = new MediaFile({
            type: 'text',
            textContent: req.body.textContent,
        });
        await media.save();
        res.status(201).json(media);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao salvar o texto.' });
    }
};

// Listar todas as mídias
const listMedia = async (req, res) => {
    try {
        const mediaFiles = await MediaFile.find();
        res.json(mediaFiles);
    } catch (err) {
        res.status(500).json({ message: 'Erro ao listar as mídias.' });
    }
};

module.exports = { uploadMedia, addTextMedia, listMedia };
