const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'N/A'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  queryType: {
    type: String,
    required: true
  },
  callStatus: {
    type: String,
    default: 'initiated'
  },
  duration: {
    type: Number,
    default: 0
  },
  transcript: {
    type: String,
    default: ''
  },
  vapiCallId: {
    type: String,
    default: ''
  },
  source: {
    type: String,
    default: 'single'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Call', callSchema);