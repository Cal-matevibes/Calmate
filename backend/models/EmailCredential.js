const mongoose = require('mongoose');

const EmailCredentialSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    unique: true,
    enum: ['gmail']
  },
  encryptedRefreshToken: {
    type: String,
    required: true
  },
  refreshTokenIv: {
    type: String,
    required: true
  },
  refreshTokenAuthTag: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('EmailCredential', EmailCredentialSchema);
