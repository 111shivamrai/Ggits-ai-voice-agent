const mongoose = require('mongoose');

const callSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true
  },
  queryType: {
    type: String,
    required: true,
    enum: ['Admissions', 'Course Details', 'Fee Structure', 'Hostel & Facilities', 'Placements', 'Other']
  },
  callStatus: {
    type: String,
    default: 'initiated'
  },
  vapiCallId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Call', callSchema);