const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    playlist: { type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' },
    lastUpdated: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Device', deviceSchema);
