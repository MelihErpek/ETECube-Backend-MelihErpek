var mongoose = require('mongoose')
const Schema = mongoose.Schema
const userSchema = new Schema({
    Email: {
        type: String
    },
    Username: {
        type: String
    },
    Password: {
        type: String
    },
})
const User = mongoose.model('User', userSchema)

module.exports = User;