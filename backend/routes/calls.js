const express = require('express');
const router = express.Router();
const axios = require('axios');
const Call = require('../models/Call');

router.post('/request', async (req, res) => {
  try {
    const { phoneNumber, queryType } = req.body;

    if (!phoneNumber || !queryType) {
      return res.status(400).json({ message: 'Phone number and query type are required' });
    }

    const phoneRegex = /^\+91[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({ message: 'Invalid phone number. Use format: +91XXXXXXXXXX' });
    }

    const newCall = new Call({ phoneNumber, queryType });
    await newCall.save();

    const vapiResponse = await axios.post(
      'https://api.vapi.ai/call/phone',
      {
        phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
        customer: {
          number: phoneNumber
        },
        assistantId: process.env.VAPI_ASSISTANT_ID
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    newCall.vapiCallId = vapiResponse.data.id;
    newCall.callStatus = 'calling';
    await newCall.save();

    res.json({ success: true, message: 'Call initiated successfully' });

  } catch (error) {
    console.error('Vapi Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate call. Please try again.' });
  }
});

module.exports = router;