const mongoose = require("mongoose");
let UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    stats: {
        win: { type: Number, required: true, default: 0 },
        loose: { type: Number, required: true, default: 0 },
        play: { type: Number, required: true, default: 0 }
    }
});
module.exports = UserSchema;