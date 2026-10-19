import React, { useState } from 'react';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [pins, setPins] = useState([]);
  const [activeNote, setActiveNote] = useState('');
  const [priority, setPriority] = useState('High');
  const [filterPriority, setFilterPriority] = useState('All');
  
  // Modal State
  const [showExportModal, setShowExportModal] = useState(false);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPins([]);
    try {
      const res = await fetch('http://localhost:5000/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (data.success) {
        setScreenshot(data.screenshotUrl);
      } else {
        alert(data.error || 'Failed to capture website.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to backend server at http://localhost:5000.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const newPin = {
      id: Date.now(),
      x,
      y,
      note: activeNote || 'Suggested improvement area',
      priority
    };
    setPins([...pins, newPin]);
    setActiveNote('');
  };

  const filteredPins = pins.filter(pin => {
    if (filterPriority === 'All') return true;
    return pin.priority === filterPriority;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f1f5f9', color: '#1e293b', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Header */}
        <header style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', justify: 'space-between', itemsCenter: 'center' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 'bold', color: '#0f172a' }}>Foundation Website Improvement Analysis</h1>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>Capture foundation layouts and map visual UX markers for your review report.</p>
          </div>
          {screenshot && (
            <button
              onClick={() => setShowExportModal(true)}
              style={{ background: '#0f172a', color: 'white', fontSize: '12px', fontWeight: '600', padding: '10px 16px', borderRadius: '12px', border: 'none', cursor: 'pointer' }}
            >
              📄 View Audit Summary Report
            </button>
          )}
        </header>

        {/* URL Form */}
        <form onSubmit={handleAnalyze} style={{ background: 'white', padding: '12px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', gap: '12px' }}>
          <input
            type="url"
            placeholder="https://inamigosfoundation.org.in"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{ flex: 1, padding: '12px 16px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '14px', outline: 'none' }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{ background: '#4f46e5', color: 'white', fontWeight: '600', padding: '12px 24px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
          >
            {loading ? 'Crawling & Capturing...' : 'Run Audit'}
          </button>
        </form>

        {/* Main Workspace */}
        {screenshot && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', alignItems: 'start' }}>
            
            {/* Screenshot Viewport (Full Column) */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>
                <span style={{ fontWeight: '600', color: '#334155' }}>Audit Screenshot Viewport</span>
                <span>💡 Click anywhere on image to add a feedback marker</span>
              </div>
              <div style={{ position: 'relative', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', cursor: 'crosshair' }}>
                <img 
                  src={screenshot} 
                  alt="Website Audit Viewport" 
                  onClick={handleImageClick}
                  style={{ width: '100%', display: 'block', userSelect: 'none' }}
                />
                {pins.map((pin, index) => (
                  <div
                    key={pin.id}
                    style={{
                      position: 'absolute',
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: pin.priority === 'High' ? '#ef4444' : pin.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      color: 'white',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      outline: '2px solid white'
                    }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Controls */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>Annotation Options</h2>
              
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Issue / Recommendation</label>
                <textarea
                  rows="3"
                  placeholder="Describe the UX flaw or improvement..."
                  value={activeNote}
                  onChange={(e) => setActiveNote(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '13px', outline: 'none' }}
                >
                  <option value="High">🔴 High Priority (UX Blocker)</option>
                  <option value="Medium">🟠 Medium Priority (Hierarchy/Copy)</option>
                  <option value="Low">🟢 Low Priority (Style/Polish)</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700' }}>Marked Issues ({filteredPins.length})</h3>
                  {pins.length > 0 && (
                    <button onClick={() => setPins([])} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}>Clear All</button>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto' }}>
                  {filteredPins.map((pin) => {
                    const originalIndex = pins.findIndex(p => p.id === pin.id) + 1;
                    return (
                      <div key={pin.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '10px', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
                          <span>Pin #{originalIndex}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '12px', color: 'white', fontSize: '10px', background: pin.priority === 'High' ? '#ef4444' : pin.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>{pin.priority}</span>
                        </div>
                        <p style={{ color: '#475569' }}>{pin.note}</p>
                      </div>
                    );
                  })}
                  {filteredPins.length === 0 && (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', padding: '20px', border: '1px dashed #cbd5e1', borderRadius: '10px' }}>
                      No pins added yet. Click on the image layout.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Modal Summary Report */}
        {showExportModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 100 }}>
            <div style={{ background: 'white', width: '100%', maxWidth: '700px', maxHeight: '85vh', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ background: '#0f172a', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '16px', fontWeight: 'bold' }}>Audit Summary Report</h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8' }}>Target: {url}</p>
                </div>
                <button onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '24px', cursor: 'pointer' }}>&times;</button>
              </div>

              <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>Audited Page Snapshot</h3>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', maxHeight: '200px', overflow: 'hidden' }}>
                    <img src={screenshot} alt="Snapshot" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <h3 style={{ fontSize: '12px', textTransform: 'uppercase', color: '#475569', marginBottom: '8px' }}>Annotated Findings ({pins.length})</h3>
                  {pins.length > 0 ? pins.map((p, i) => (
                    <div key={p.id} style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '6px', fontSize: '12px', display: 'flex', justifyContent: 'space-between' }}>
                      <span><b>Issue #{i + 1}:</b> {p.note}</span>
                      <span style={{ fontWeight: 'bold', color: p.priority === 'High' ? '#ef4444' : p.priority === 'Medium' ? '#f59e0b' : '#10b981' }}>{p.priority}</span>
                    </div>
                  )) : <p style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic' }}>No pins added yet.</p>}
                </div>
              </div>

              <div style={{ padding: '16px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Foundation Website Improvement Analysis</span>
                <button onClick={() => window.print()} style={{ background: '#4f46e5', color: 'white', padding: '10px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>🖨️ Print / Save as PDF</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}