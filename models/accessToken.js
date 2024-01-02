const mongoose = require('mongoose');

const {Schema} = mongoose;

const accessTokenSchema = Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.SchemaTypes.ObjectId, ref: 'User'}
},
{timestamps: true}

);

module.exports = mongoose.model('AccessToken', accessTokenSchema, 'access tokens');