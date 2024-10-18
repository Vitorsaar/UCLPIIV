const mongoose = require('mongoose');

const mediaFileSchema = new mongoose.Schema({
    type: { type: String, enum: ['image', 'video', 'text'], required: true },
    url: { type: String, required: true }, // Caminho do arquivo ou link
    textContent: { type: String }, // Para mídia de texto
    uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('MediaFile', mediaFileSchema);
