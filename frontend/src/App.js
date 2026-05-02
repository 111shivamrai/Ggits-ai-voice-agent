import { useState } from 'react';

function App() {
  const [phone, setPhone] = useState('');
  const [queryType, setQueryType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    if (!phone || phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!queryType) {
      setError('Please select what your query is about.');
      return;
    }

    const fullPhone = '+91' + phone;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5002/api/calls/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone, queryType })
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Cannot connect to server. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f0f2f8' }}>

      {/* Top Bar */}
      <div style={{ backgroundColor: '#1a237e' }} className="py-3 px-6 flex items-center gap-4">
        <img
          src="https://ggits.org/light-logo.png"
          alt="GGITS Logo"
          className="h-10 object-contain"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        <div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 13 }}>
            Gyan Ganga Institute of Technology & Sciences
          </p>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
            Jabalpur, Madhya Pradesh · AICTE Approved
          </p>
        </div>
      </div>

      {/* Hero Strip */}
      <div style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '28px 28px 40px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,111,0,0.2)', border: '1px solid rgba(255,111,0,0.4)',
          color: '#ffb74d', fontSize: 10, fontWeight: 700, letterSpacing: 1,
          padding: '4px 12px', borderRadius: 20, marginBottom: 12,
          textTransform: 'uppercase'
        }}>
          🤖 AI-Powered Assistant
        </div>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
          Talk to Our AI<br />College Assistant
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12, marginBottom: 16 }}>
          Get instant answers — we'll call you in under 10 seconds
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['Admissions', 'Courses', 'Fees', 'Hostel', 'Placements'].map(tag => (
            <span key={tag} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'rgba(255,255,255,0.9)',
              fontSize: 10, fontWeight: 600,
              padding: '4px 10px', borderRadius: 20
            }}>
              ✓ {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div style={{ margin: '-12px 16px 0', background: '#fff', borderRadius: 16, padding: '24px 20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>

        {submitted ? (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{
              width: 72, height: 72, background: 'linear-gradient(135deg,#1a237e,#283593)',
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, margin: '0 auto 16px'
            }}>📞</div>
            <h2 style={{ color: '#1a237e', fontSize: 20, fontWeight: 800, marginBottom: 8 }}>
              Request Submitted!
            </h2>
            <p style={{ color: '#6b7280', fontSize: 13, lineHeight: 1.6 }}>
              Your call is being connected.<br />Please answer your phone in 10 seconds.
            </p>
            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {['Your request has been received', 'AI assistant is being prepared', `Calling +91 ${phone}`].map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  background: '#e8eaf6', borderRadius: 10, padding: '10px 14px',
                  fontSize: 12, color: '#1a237e', fontWeight: 600
                }}>
                  <div style={{
                    width: 22, height: 22, background: i === 0 ? '#1a237e' : i === 1 ? '#ff6f00' : '#9ca3af',
                    color: '#fff', borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0
                  }}>
                    {i === 0 ? '✓' : i + 1}
                  </div>
                  {s}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setSubmitted(false); setPhone(''); setQueryType(''); }}
              style={{ marginTop: 20, fontSize: 12, color: '#1a237e', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Submit another request
            </button>
          </div>
        ) : (
          <>
            {/* Phone Input */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Your Phone Number
            </label>
            <div style={{ display: 'flex', border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
              <div style={{ background: '#e8eaf6', color: '#1a237e', fontWeight: 700, fontSize: 13, padding: '12px 14px', borderRight: '2px solid #e5e7eb', whiteSpace: 'nowrap' }}>
                🇮🇳 +91
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="Enter 10-digit number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                style={{ flex: 1, padding: '12px 14px', fontSize: 14, outline: 'none', border: 'none', fontFamily: 'inherit' }}
              />
            </div>

            {/* Dropdown */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' }}>
              Your Query Is About
            </label>
            <select
              value={queryType}
              onChange={e => setQueryType(e.target.value)}
              style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 13, marginBottom: 16, outline: 'none', background: '#fff', fontFamily: 'inherit' }}
            >
              <option value="">-- Select a topic --</option>
              <option>Admissions</option>
              <option>Course Details</option>
              <option>Fee Structure</option>
              <option>Hostel & Facilities</option>
              <option>Placements</option>
              <option>Other</option>
            </select>

            {/* Error */}
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{error}</p>}

            {/* Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: 16,
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ff6f00, #ff8f00)',
                color: '#fff', border: 'none', borderRadius: 14,
                fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 8px 24px rgba(255,111,0,0.35)', fontFamily: 'inherit'
              }}
            >
              {loading ? 'Connecting...' : '📞  Call Me Now'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10 }}>
              📱 You'll receive a call within 10 seconds · Free of charge
            </p>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '24px 16px', fontSize: 10, color: '#9ca3af' }}>
        © 2024 Gyan Ganga Institute of Technology and Sciences · Jabalpur
      </div>
    </div>
  );
}

export default App;