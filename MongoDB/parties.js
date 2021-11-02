const mongoose = require("mongoose");
let GameSchema = new mongoose.Schema({
    round: { type: String, required: true, default: 1 },
    pointer: { type: String, required: true, default: 5 },
    J1: {
        id: { type: String, required: true },
        coins: { type: Number, default: 100 },
        connected: { type: Boolean, required: true, default: false},
        last_update: { type: Date, required: false},
        bet: {type: Number, required: true, default:0, min: 0, max: 100}
    },
    J2: {
        id: { type: String, required: true },
        coins: { type: Number, default: 100 },
        connected : {type: Boolean, required: true, default: false},
        last_update: { type: Date, required: false},
        bet: {type: Number, required: true, default:0, min: 0, max: 100}
    },
    specs : { type: Array},
    status: { type: String, enum: ['WAITING', 'STARTED', 'FINISHED', 'CANCELED'], default: 'WAITING' },
    date: { type: Date, default: Date.now },
    event: { type: String, required: true, default: 'wait'},
    next_event: { type: Date, required: true, default: Date.now}
});
module.exports = GameSchema;