const mongoose = require("mongoose");
let GameSchema = new mongoose.Schema({
    round: { type: String, required: true, default: 1 },
    pointer: { type: String, required: true, default: 5 },
    J1: {
        id: { type: String, required: true },
        coins: { type: Number, default: 100 }
    },
    J2: {
        id: { type: String, required: true },
        coins: { type: Number, default: 100 }
    },
    specs : { type: Array},
    status: { type: String, enum: ['WAITING', 'STARTED', 'FINISHED'], default: 'WAITING' },
    date: { type: Date, default: Date.now }
});
module.exports = GameSchema;