'use strict'

const mongoose = require('../config/mongodb'),
bcrypt   = require('bcrypt-nodejs')

// define schema for user model
let userSchema = mongoose.Schema({

    local: {
        email: String,
        password: String,
    },
    facebook: {
        id: String,
        token: String,
        displayName: String,
        pic: String
    },
    github: {
        id: String,
        token: String,
        displayName: String,
        username: String
    }

})

// generate hash
userSchema.methods.generateHash = function(password) 
{
return bcrypt.hashSync(password,bcrypt.genSaltSync(8), null)
}

// check if password is valid
userSchema.methods.validPassword = function(password) {
return bcrypt.compareSync(password,this.local.password)
}

var User= mongoose.model('User', userSchema)
// create the model for users and expose it to app
module.exports = User;
