const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    lineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'line',
        required: true
    },
    lineName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Overload', 'Short Circuit', 'Voltage Drop'],
        default: 'Overload'
    },
    status: {
        type: String,
        enum: ['Active', 'Resolved'],
        default: 'Active'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    resolvedTimestamp: {
        type: Date
    }
});

module.exports = mongoose.model('alert', AlertSchema);