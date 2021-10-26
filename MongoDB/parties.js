const mongoose = require("mongoose");
let GameSchema = new mongoose.Schema({
    round: { type: String, required: true, default: 1 },
    pointer: { type: String, required: true, default: 5 },
    J1: {
        _id: { type: Number, required: true, },
        coins: { type: Number, required: true, default: 100 }
    },
    J2: {
        _id: { type: Number, required: true, },
        coins: { type: Number, required: true, default: 100 }
    },
    specs : { type: Array},
    status: { type: String, enum: ['WATING', 'STARTED', 'FINISHED'], default: 'WAITING' },
    date: { type: Date, default: Date.now }
});
module.exports = GameSchema;