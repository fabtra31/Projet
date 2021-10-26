const mongoose = require("mongoose");
let UserSchema = new mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    });
module.exports = UserSchema;