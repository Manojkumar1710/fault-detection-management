const mongoose = require('mongoose');

const LineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Operational', 'Fault', 'Offline'],
        default: 'Operational'
    },
    currentLoad: {
        type: Number, // Stored in kW
        default: 10.0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('line', LineSchema);