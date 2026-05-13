import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const [phone, setPhone] = useState('');
  const [queryType, setQueryType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
        setError(data.message || 'Something went wrong.');
      }
    } catch (err) {
      setError('Cannot connect to server.');
    }

    setLoading(false);
  };

  if (submitted) {
    return (
      <div style={{ backgroundColor: '#f0f2f8', minHeight: '100vh' }}>
        <div style={{ backgroundColor: '#1a237e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <img src="https://ggits.org/light-logo.png" alt="GGITS" style={{ height: 40, filter: 'brightness(0) invert(1)' }} />
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>Gyan Ganga Institute of Technology & Sciences</p>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>Jabalpur, Madhya Pradesh · AICTE Approved</p>
            </div>
          </div>
          <button onClick={() => navigate('/admin')} style={{ color: '#ffb74d', background: 'transparent', border: '2px solid #ffb74d', fontWeight: 700, fontSize: 12, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
            🔐 Admin Portal
          </button>
        </div>

        <div style={{ maxWidth: 520, margin: '60px auto', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #1a237e, #283593)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px', color: '#fff' }}>📞</div>
          <h2 style={{ color: '#1a237e', margin: '0 0 8px 0', fontSize: 22, fontWeight: 800 }}>Request Submitted!</h2>
          <p style={{ color: '#666', margin: '0 0 24px 0', fontSize: 14 }}>Your call will arrive in 10 seconds. Calling +91{phone}</p>
          <button onClick={() => { setSubmitted(false); setPhone(''); setQueryType(''); }} style={{ padding: '10px 24px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#f0f2f8', minHeight: '100vh' }}>

      {/* TOP BAR */}
      <div style={{ backgroundColor: '#1a237e', padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img src="https://ggits.org/light-logo.png" alt="GGITS" style={{ height: 40, filter: 'brightness(0) invert(1)' }} />
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, margin: 0 }}>Gyan Ganga Institute of Technology & Sciences</p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, margin: 0 }}>Jabalpur, Madhya Pradesh · AICTE Approved</p>
          </div>
        </div>
        <button onClick={() => navigate('/admin')} style={{ color: '#ffb74d', background: 'transparent', border: '2px solid #ffb74d', fontWeight: 700, fontSize: 12, padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit' }}>
          🔐 Admin Portal
        </button>
      </div>

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a237e, #283593)', padding: '32px 28px', color: '#fff', textAlign: 'center' }}>
        <p style={{ fontSize: 10, color: '#ffb74d', fontWeight: 700, margin: '0 0 12px 0', letterSpacing: 2, textTransform: 'uppercase' }}>🤖 AI-Powered Assistant</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px 0', lineHeight: 1.3 }}>Talk to Our AI College Assistant</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: '0 0 18px 0' }}>Get instant answers in under 10 seconds</p>
      </div>

      {/* FORM CARD */}
      <div style={{ maxWidth: 520, margin: '-20px auto 40px', background: '#fff', borderRadius: 16, padding: 32, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        
        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Your Phone Number</label>
        <div style={{ display: 'flex', border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ background: '#e8eaf6', padding: '12px 14px', fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap', fontSize: 13 }}>🇮🇳 +91</div>
          <input type="tel" maxLength={10} placeholder="Enter 10-digit number" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} style={{ flex: 1, padding: '12px 14px', fontSize: 14, border: 'none', outline: 'none', fontFamily: 'inherit' }} />
        </div>

        <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase' }}>Your Query Is About</label>
        <select value={queryType} onChange={e => setQueryType(e.target.value)} style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, marginBottom: 20, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
          <option value="">-- Select a topic --</option>
          <option>Admissions</option>
          <option>Course Details</option>
          <option>Fee Structure</option>
          <option>Hostel & Facilities</option>
          <option>Placements</option>
          <option>Other</option>
        </select>

        {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 16 }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 16, background: loading ? '#9ca3af' : 'linear-gradient(135deg, #ff6f00, #ff8f00)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>
          {loading ? 'Connecting...' : '📞 Call Me Now'}
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>📱 Free of charge · Call within 10 seconds</p>

        <a href="/syllabus.pdf" download="GGITS_Syllabus.pdf" style={{ display: 'block', padding: 14, background: 'linear-gradient(135deg, #1a237e, #283593)', color: '#fff', textDecoration: 'none', textAlign: 'center', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
          📥 Download College Syllabus PDF
        </a>
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px 0' }}>© Gyan Ganga Institute of Technology · Jabalpur</p>
        <button onClick={() => navigate('/admin')} style={{ fontSize: 11, color: '#1a237e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          🔐 Admin Portal
        </button>
      </div>
    </div>
  );
}

export default App;