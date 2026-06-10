const express = require('express');
const router = express.Router();
const axios = require('axios');
const Call = require('../models/Call');

// Helper: make one Vapi call
const makeVapiCall = async (phoneNumber, name, queryType, source) => {
  const vapiResponse = await axios.post(
    'https://api.vapi.ai/call/phone',
    {
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      customer: { number: phoneNumber },
      assistantId: process.env.VAPI_ASSISTANT_ID
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const call = new Call({
    name: name || 'N/A',
    phoneNumber,
    queryType,
    callStatus: 'calling',
    vapiCallId: vapiResponse.data.id || '',
    source: source || 'single'
  });
  await call.save();

  return { success: true, vapiCallId: vapiResponse.data.id };
};

// ─── SINGLE CALL ──────────────────────────────
router.post('/request', async (req, res) => {
  const { phoneNumber, queryType, name } = req.body;

  if (!phoneNumber || !queryType) {
    return res.status(400).json({ message: 'Phone number and query type are required' });
  }

  const phoneRegex = /^\+91[0-9]{10}$/;
  if (!phoneRegex.test(phoneNumber)) {
    return res.status(400).json({ message: 'Invalid phone number. Use format: +91XXXXXXXXXX' });
  }

  try {
    await makeVapiCall(phoneNumber, name, queryType, 'single');
    res.json({ success: true, message: 'Call initiated successfully' });
  } catch (error) {
    console.error('Vapi Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate call. Please try again.' });
  }
});

// ─── BULK CALL ────────────────────────────────
// Accepts: { numbers: [{name, phone}], queryType }
// Max 15 numbers. Sends in batches of 10.
router.post('/bulk', async (req, res) => {
  const { numbers, queryType } = req.body;

  if (!numbers || numbers.length === 0) {
    return res.status(400).json({ message: 'No numbers provided' });
  }
  if (numbers.length > 15) {
    return res.status(400).json({ message: 'Maximum 15 numbers allowed' });
  }
  if (!queryType) {
    return res.status(400).json({ message: 'Query type is required' });
  }

  const results = [];

  const callOne = async (person) => {
    const phone = person.phone.startsWith('+') ? person.phone : '+91' + person.phone.replace(/\D/g, '');
    try {
      await makeVapiCall(phone, person.name || 'N/A', queryType, 'bulk');
      return { name: person.name || 'N/A', phone, status: 'success' };
    } catch (err) {
      console.error('Bulk call failed for:', phone, err.message);
      return { name: person.name || 'N/A', phone, status: 'failed' };
    }
  };

  // Batch 1: first 10
  const batch1 = numbers.slice(0, 10);
  const batch1Results = await Promise.all(batch1.map(callOne));
  results.push(...batch1Results);

  // Batch 2: remaining (max 5)
  const batch2 = numbers.slice(10);
  if (batch2.length > 0) {
    await new Promise(r => setTimeout(r, 3000)); // wait 3 sec
    const batch2Results = await Promise.all(batch2.map(callOne));
    results.push(...batch2Results);
  }

  const successCount = results.filter(r => r.status === 'success').length;
  res.json({
    success: true,
    message: `${successCount} of ${numbers.length} calls initiated`,
    results
  });
});

module.exports = router;