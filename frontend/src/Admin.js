import { useState, useEffect } from 'react';

const ADMIN_PASSWORD = 'ggits@admin2024';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [calls, setCalls] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setError('');
    } else {
      setError('Wrong password. Try again.');
    }
  };

  const fetchData = async () => {
    try {
      const [callsRes, statsRes] = await Promise.all([
        fetch('http://localhost:5002/api/admin/calls', { headers: { password: ADMIN_PASSWORD } }),
        fetch('http://localhost:5002/api/admin/stats', { headers: { password: ADMIN_PASSWORD } })
      ]);
      const callsData = await callsRes.json();
      const statsData = await statsRes.json();
      setCalls(callsData);
      setStats(statsData);
    } catch {
      setError('Failed to load data. Is the backend running?');
    }
  };

  const exportToCSV = () => {
    const headers = ['Phone Number', 'Query Type', 'Status', 'Date & Time'];
    const rows = calls.map(call => [
      call.phoneNumber,
      call.queryType,
      call.callStatus,
      new Date(call.createdAt).toLocaleString('en-IN')
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'GGITS_Calls_Report.csv';
    a.click();
  };

  useEffect(() => {
    if (loggedIn) fetchData();
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f2f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', width: 480 }}>
          <div style={{ background: 'linear-gradient(160deg,#1a237e,#0d1257)', padding: '40px 28px', width: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <img src="https://ggits.org/light-logo.png" alt="GGITS" style={{ height: 32, filter: 'brightness(0) invert(1)', marginBottom: 16 }} />
            <p style={{ color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Admin Portal</p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, lineHeight: 1.6 }}>Restricted access for HOD and authorized staff only.</p>
          </div>
          <div style={{ flex: 1, padding: '36px 28px' }}>
            <h2 style={{ color: '#1a237e', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Welcome Back</h2>
            <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 24 }}>Sign in to view analytics</p>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ width: '100%', border: '2px solid #e5e7eb', borderRadius: 12, padding: '12px 16px', fontSize: 14, marginBottom: 12, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            {error && <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>{error}</p>}
            <button
              onClick={handleLogin}
              style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg,#1a237e,#283593)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}
            >
              → Sign In
            </button>
            <p style={{ textAlign: 'center', fontSize: 10, color: '#9ca3af', marginTop: 12 }}>🔒 GGITS Authorized Personnel Only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f0f2f8' }}>

      {/* Sidebar */}
      <div style={{ background: '#0d1257', width: 200, padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{ textAlign: 'center', paddingBottom: 20, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="https://ggits.org/light-logo.png" alt="GGITS" style={{ height: 30, filter: 'brightness(0) invert(1)' }} />
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginTop: 6 }}>Admin Panel</p>
        </div>

        {[['📊', 'Dashboard'], ['📋', 'All Calls'], ['📈', 'Analytics'], ['⬇️', 'Export Report']].map(([icon, label], i) => (
          <div
            key={label}
            onClick={() => {
              if (label === 'Export Report') exportToCSV();
              if (label === 'All Calls') fetchData();
            }}
            style={{
              padding: '9px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: i === 0 ? '#ffb74d' : 'rgba(255,255,255,0.55)',
              background: i === 0 ? 'rgba(255,111,0,0.2)' : 'transparent',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            {icon} {label}
          </div>
        ))}

        <div style={{ marginTop: 'auto' }}>
          <div
            onClick={() => setLoggedIn(false)}
            style={{ padding: '9px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.55)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            🚪 Logout
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h1 style={{ color: '#1a237e', fontWeight: 800, fontSize: 20, margin: 0 }}>Dashboard Overview</h1>
            <p style={{ fontSize: 11, color: '#6b7280', margin: 0 }}>{new Date().toDateString()} · Live Data</p>
          </div>
          <button
            onClick={fetchData}
            style={{ background: '#ff6f00', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            ⟳ Refresh
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: '#1a237e', lineHeight: 1 }}>{stats.totalToday}</div>
              <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>Total Today</div>
            </div>
            {stats.byType && stats.byType.map(item => (
              <div key={item._id} style={{ background: '#fff', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#ff6f00', lineHeight: 1 }}>{item.count}</div>
                <div style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>{item._id}</div>
              </div>
            ))}
          </div>
        )}

        {/* Calls Table */}
        <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a237e' }}>Recent Calls</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>All call records, newest first</div>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#1a237e' }}>
                {['Phone Number', 'Query Type', 'Status', 'Date & Time'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 10, letterSpacing: 0.5, textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {calls.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No calls yet today</td></tr>
              ) : calls.map((call, i) => (
                <tr key={call._id} style={{ background: i % 2 === 0 ? '#fff' : '#fafbff', borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{call.phoneNumber}</td>
                  <td style={{ padding: '11px 16px', color: '#374151' }}>{call.queryType}</td>
                  <td style={{ padding: '11px 16px' }}>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      background: call.callStatus === 'calling' ? '#dcfce7' : '#fef9c3',
                      color: call.callStatus === 'calling' ? '#166534' : '#854d0e'
                    }}>
                      {call.callStatus}
                    </span>
                  </td>
                  <td style={{ padding: '11px 16px', color: '#6b7280' }}>{new Date(call.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}