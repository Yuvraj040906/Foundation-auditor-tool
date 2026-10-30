import React, { useState } from 'react';
import './index.css';

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [error, setError] = useState('');

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setScreenshot(null);

    try {
      // Replace with your live Render backend URL
      const response = await fetch('https://foundation-auditor-tool.onrender.com/api/audit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to capture screenshot');
      }

      setScreenshot(data.image);
    } catch (err) {
      setError(err.message || 'Something went wrong connecting to the backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-6">
      <header className="w-full max-w-4xl text-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-blue-400 mb-2">
          Foundation Website Improvement Analysis
        </h1>
        <p className="text-slate-400">
          Capture screenshots, analyze UX issues, and audit your web pages instantly.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-slate-800 p-6 rounded-xl shadow-xl border border-slate-700">
        <form onSubmit={handleAudit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Website URL to Audit
            </label>
            <input
              type="url"
              required
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 transition font-semibold rounded-lg disabled:opacity-50"
          >
            {loading ? 'Analyzing & Capturing...' : 'Run Audit'}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        {screenshot && (
          <div className="mt-8 flex flex-col items-center">
            <h3 className="text-lg font-semibold mb-3 text-slate-200">Audit Screenshot Result</h3>
            <div className="border border-slate-700 rounded-lg overflow-hidden bg-slate-900 shadow-lg max-h-96 overflow-y-auto">
              <img src={screenshot} alt="Website Screenshot" className="w-full h-auto" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}