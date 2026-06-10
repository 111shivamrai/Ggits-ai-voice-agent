import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND = 'https://ggits-backend.onrender.com';

function App() {
  const navigate = useNavigate();

  // Single call
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [queryType, setQueryType] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Bulk call
  const [tab, setTab] = useState('single');
  const [bulkText, setBulkText] = useState('');
  const [bulkQuery, setBulkQuery] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState(null);
  const [bulkError, setBulkError] = useState('');
  const fileRef = useRef(null);

  // Parse bulk numbers from text
  // Supports: "Name, Number" or just "Number"
  const parseNumbers = (text) => {
    return text.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0)
      .map(line => {
        const parts = line.split(',').map(p => p.trim());
        if (parts.length >= 2) {
          return { name: parts[0], phone: parts[1].replace(/\D/g, '') };
        }
        return { name: 'N/A', phone: parts[0].replace(/\D/g, '') };
      })
      .filter(p => p.phone.length >= 10);
  };

  // Handle CSV/TXT file upload
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBulkText(ev.target.result);
    reader.readAsText(file);
  };

  // Single call submit
  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!phone || phone.length !== 10) { setError('Please enter a valid 10-digit phone number.'); return; }
    if (!queryType) { setError('Please select your query topic.'); return; }

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/calls/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phoneNumber: '+91' + phone, queryType })
      });
      const data = await res.json();
      if (res.ok) setSubmitted(true);
      else setError(data.message || 'Something went wrong.');
    } catch {
      setError('Cannot connect to server. Please try again.');
    }
    setLoading(false);
  };

  // Bulk call submit
  const handleBulkCall = async () => {
    setBulkError('');
    if (!bulkText.trim()) { setBulkError('Please enter numbers or upload a file.'); return; }
    if (!bulkQuery) { setBulkError('Please select a query type.'); return; }

    const numbers = parseNumbers(bulkText);
    if (numbers.length === 0) { setBulkError('No valid numbers found.'); return; }
    if (numbers.length > 15) { setBulkError('Maximum 15 numbers allowed.'); return; }

    setBulkLoading(true);
    try {
      const res = await fetch(`${BACKEND}/api/calls/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbers, queryType: bulkQuery })
      });
      const data = await res.json();
      setBulkResults(data);
    } catch {
      setBulkError('Cannot connect to server. Please try again.');
    }
    setBulkLoading(false);
  };

  // Success screen
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
          <div style={{ width: 72, height: 72, background: 'linear-gradient(135deg,#1a237e,#283593)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 20px' }}>📞</div>
          <h2 style={{ color: '#1a237e', margin: '0 0 8px', fontSize: 22, fontWeight: 800 }}>Call Incoming, {name}!</h2>
          <p style={{ color: '#666', margin: '0 0 24px', fontSize: 14 }}>Calling +91{phone} within 10 seconds. Please keep your phone ready.</p>
          <button onClick={() => { setSubmitted(false); setName(''); setPhone(''); setQueryType(''); }}
            style={{ padding: '10px 24px', background: '#1a237e', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', fontSize: 13 }}>
            Submit Another Request
          </button>
        </div>
      </div>
    );
  }

  const parsed = parseNumbers(bulkText);

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
        <p style={{ fontSize: 10, color: '#ffb74d', fontWeight: 700, margin: '0 0 12px', letterSpacing: 2, textTransform: 'uppercase' }}>🤖 AI-Powered Assistant</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 10px', lineHeight: 1.3 }}>Talk to Our AI College Assistant</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Get instant answers in under 10 seconds</p>
      </div>

      {/* CARD */}
      <div style={{ maxWidth: 520, margin: '-20px auto 40px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.1)', overflow: 'hidden' }}>

        {/* TABS */}
        <div style={{ display: 'flex', borderBottom: '2px solid #e5e7eb' }}>
          {[['single', '📞 Single Call'], ['bulk', '📋 Bulk Call (Max 15)']].map(([key, label]) => (
            <button key={key} onClick={() => { setTab(key); setBulkResults(null); setBulkError(''); }}
              style={{ flex: 1, padding: '14px', background: tab === key ? '#e8eaf6' : '#fff', color: '#1a237e', border: 'none', fontWeight: 700, fontSize: 13, cursor: 'pointer', borderBottom: tab === key ? '3px solid #1a237e' : '3px solid transparent', fontFamily: 'inherit' }}>
              {label}
            </button>
          ))}
        </div>

        {/* ── SINGLE CALL TAB ── */}
        {tab === 'single' && (
          <div style={{ padding: '28px 28px' }}>

            {/* Name */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Full Name</label>
            <input type="text" placeholder="Enter your full name" value={name}
              onChange={e => setName(e.target.value)}
              style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 14, outline: 'none', fontFamily: 'inherit', marginBottom: 18, boxSizing: 'border-box' }} />

            {/* Phone */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Phone Number</label>
            <div style={{ display: 'flex', border: '2px solid #e5e7eb', borderRadius: 12, overflow: 'hidden', marginBottom: 18 }}>
              <div style={{ background: '#e8eaf6', padding: '12px 14px', fontWeight: 700, color: '#1a237e', whiteSpace: 'nowrap', fontSize: 13 }}>🇮🇳 +91</div>
              <input type="tel" maxLength={10} placeholder="Enter 10-digit number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                style={{ flex: 1, padding: '12px 14px', fontSize: 14, border: 'none', outline: 'none', fontFamily: 'inherit' }} />
            </div>

            {/* Query */}
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Your Query Is About</label>
            <select value={queryType} onChange={e => setQueryType(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, marginBottom: 18, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
              <option value="">-- Select a topic --</option>
              <option>Admissions</option>
              <option>Course Details</option>
              <option>Fee Structure</option>
              <option>Hostel & Facilities</option>
              <option>Placements</option>
              <option>Other</option>
            </select>

            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 14 }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: 16, background: loading ? '#9ca3af' : 'linear-gradient(135deg,#ff6f00,#ff8f00)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 12, fontFamily: 'inherit' }}>
              {loading ? 'Connecting...' : '📞 Call Me Now'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>📱 Free of charge · Call within 10 seconds</p>

            <a href="/syllabus.pdf" download="GGITS_Syllabus.pdf"
              style={{ display: 'block', padding: 14, background: 'linear-gradient(135deg,#1a237e,#283593)', color: '#fff', textDecoration: 'none', textAlign: 'center', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>
              📥 Download College Syllabus PDF
            </a>
          </div>
        )}

        {/* ── BULK CALL TAB ── */}
        {tab === 'bulk' && (
          <div style={{ padding: '28px 28px' }}>

            {bulkResults ? (
              /* Results screen */
              <div>
                <h3 style={{ color: '#1a237e', fontWeight: 800, fontSize: 16, marginBottom: 6 }}>📊 Call Results</h3>
                <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 16 }}>{bulkResults.message}</p>
                {bulkResults.results && bulkResults.results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 14px', background: r.status === 'success' ? '#dcfce7' : '#fee2e2', borderRadius: 8, marginBottom: 6 }}>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#1f2937' }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: '#6b7280', marginLeft: 8 }}>{r.phone}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.status === 'success' ? '#15803d' : '#dc2626' }}>
                      {r.status === 'success' ? '✓ Called' : '✗ Failed'}
                    </span>
                  </div>
                ))}
                <button onClick={() => { setBulkResults(null); setBulkText(''); setBulkQuery(''); }}
                  style={{ marginTop: 16, width: '100%', padding: 12, background: '#1a237e', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  ← Make Another Bulk Call
                </button>
              </div>
            ) : (
              <>
                {/* Instructions box */}
                <div style={{ background: '#e8eaf6', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#1a237e', margin: '0 0 4px' }}>📌 HOW TO FORMAT:</p>
                  <p style={{ fontSize: 10, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                    One entry per line.<br />
                    Format: <b>Name, PhoneNumber</b><br />
                    Example: Rahul Sharma, 9876543210<br />
                    Or just number: 9876543210<br />
                    Maximum: 15 numbers
                  </p>
                </div>

                {/* Text area */}
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Type or Paste Numbers</label>
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"Rahul Sharma, 9876543210\nPriya Singh, 9876543211\nAmit Kumar, 9876543212"}
                  rows={7}
                  style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', fontSize: 12, fontFamily: 'monospace', outline: 'none', resize: 'vertical', marginBottom: 12, boxSizing: 'border-box' }}
                />

                {/* Count preview */}
                {bulkText.trim() && (
                  <div style={{ background: parsed.length > 15 ? '#fee2e2' : '#dcfce7', borderRadius: 8, padding: '7px 12px', marginBottom: 14 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: parsed.length > 15 ? '#dc2626' : '#15803d', margin: 0 }}>
                      {parsed.length} number{parsed.length !== 1 ? 's' : ''} detected
                      {parsed.length > 15 ? ' — MAXIMUM 15 ALLOWED' : ' — Ready to call'}
                    </p>
                  </div>
                )}

                {/* OR divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700 }}>OR UPLOAD FILE</span>
                  <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
                </div>

                {/* File upload */}
                <input type="file" accept=".csv,.txt" ref={fileRef} onChange={handleFile} style={{ display: 'none' }} />
                <button onClick={() => fileRef.current.click()}
                  style={{ width: '100%', padding: 12, border: '2px dashed #c5cae9', background: '#f8f9ff', borderRadius: 12, color: '#1a237e', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginBottom: 18, fontFamily: 'inherit' }}>
                  📎 Upload CSV or TXT File
                </button>

                {/* Query type */}
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>Query Type For All Calls</label>
                <select value={bulkQuery} onChange={e => setBulkQuery(e.target.value)}
                  style={{ width: '100%', padding: '12px 14px', border: '2px solid #e5e7eb', borderRadius: 12, fontSize: 13, marginBottom: 18, outline: 'none', fontFamily: 'inherit', background: '#fff' }}>
                  <option value="">-- Select a topic --</option>
                  <option>Admissions</option>
                  <option>Course Details</option>
                  <option>Fee Structure</option>
                  <option>Hostel & Facilities</option>
                  <option>Placements</option>
                  <option>Demo Call</option>
                </select>

                {bulkError && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 14 }}>{bulkError}</p>}

                <button onClick={handleBulkCall} disabled={bulkLoading}
                  style={{ width: '100%', padding: 16, background: bulkLoading ? '#9ca3af' : 'linear-gradient(135deg,#1a237e,#283593)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 800, fontSize: 15, cursor: bulkLoading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                  {bulkLoading ? '⏳ Calling all numbers...' : '📞 Call All Numbers Now'}
                </button>
                <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 10 }}>All calls placed within 60 seconds</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div style={{ textAlign: 'center', padding: '24px 16px' }}>
        <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 8px' }}>© Gyan Ganga Institute of Technology · Jabalpur</p>
        <button onClick={() => navigate('/admin')} style={{ fontSize: 11, color: '#1a237e', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
          🔐 Admin Portal
        </button>
      </div>
    </div>
  );
}

export default App;