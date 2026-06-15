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
  console.log('📥 RECEIVED REQUEST BODY:', JSON.stringify(req.body));

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

  const batch1 = numbers.slice(0, 10);
  const batch1Results = await Promise.all(batch1.map(callOne));
  results.push(...batch1Results);

  const batch2 = numbers.slice(10);
  if (batch2.length > 0) {
    await new Promise(r => setTimeout(r, 3000));
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

// ─── WEBHOOK: Vapi sends call data here when call ends ───
router.post('/webhook', async (req, res) => {
  try {
    const message = req.body.message;

    console.log('========== WEBHOOK RECEIVED ==========');
    console.log('Message Type:', message?.type);
    console.log('FULL BODY:', JSON.stringify(req.body, null, 2));
    console.log('=======================================');

    if (!message) {
      return res.status(200).json({ received: true });
    }

    if (message.type === 'end-of-call-report') {
      const callId = message.call?.id;

      let transcript = '';
      if (typeof message.transcript === 'string') {
        transcript = message.transcript;
      } else if (typeof message.artifact?.transcript === 'string') {
        transcript = message.artifact.transcript;
      } else if (Array.isArray(message.artifact?.messages)) {
        transcript = message.artifact.messages
          .filter(m => m.role === 'user' || m.role === 'bot' || m.role === 'assistant')
          .map(m => {
            const speaker = m.role === 'user' ? 'USER' : 'AI';
            return `${speaker}: ${m.message || m.content || ''}`;
          })
          .join('\n');
      } else if (Array.isArray(message.messages)) {
        transcript = message.messages
          .filter(m => m.role === 'user' || m.role === 'bot' || m.role === 'assistant')
          .map(m => {
            const speaker = m.role === 'user' ? 'USER' : 'AI';
            return `${speaker}: ${m.message || m.content || ''}`;
          })
          .join('\n');
      }

      const durationSeconds = Math.round(
        message.durationSeconds || message.duration || 0
      );

      console.log('Extracted Call ID:', callId);
      console.log('Extracted Transcript Length:', transcript.length);
      console.log('Extracted Duration:', durationSeconds);

      if (callId) {
        const updated = await Call.findOneAndUpdate(
          { vapiCallId: callId },
          {
            transcript: transcript,
            duration: durationSeconds,
            callStatus: 'completed'
          },
          { new: true }
        );

        if (updated) {
          console.log(`✅ Transcript saved for call ${callId} (${durationSeconds}s, ${transcript.length} chars)`);
        } else {
          console.log(`⚠️ No matching call found in DB for vapiCallId: ${callId}`);
        }
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(200).json({ received: true });
  }
});

// ─── DEBUG: View raw call data directly ───
router.get('/debug', async (req, res) => {
  try {
    const calls = await Call.find().sort({ createdAt: -1 }).limit(5);
    res.json(calls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;