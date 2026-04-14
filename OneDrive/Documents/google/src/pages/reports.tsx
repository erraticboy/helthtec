import React, { useState } from 'react';
import Layout from '@/components/Layout';
import { Camera, FileText, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { performOCR, classifyReport } from '@/lib/ocr';

const ReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setResult(null);
    try {
      const text = await performOCR(file, setOcrProgress);
      const category = classifyReport(text);
      setResult({ text, category, timestamp: new Date().toLocaleTimeString() });
    } catch (err) {
      alert('Failed to process image');
    } finally {
      setLoading(false);
      setOcrProgress('');
    }
  };

  return (
    <Layout title="Data Collection | HealthGap AI">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Reporting Hub</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Submit medical records via form or handwritten scan.</p>
        </section>

        {/* OCR Upload Card */}
        <section className="glass" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: 'rgba(0, 209, 255, 0.1)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--primary)'
            }}>
              {loading ? <Loader2 className="animate-spin" size={32} /> : <Camera size={32} />}
            </div>
          </div>
          <h3 style={{ marginBottom: '8px' }}>OCR Scan (Offline Ready)</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Upload a photo of a handwritten report to extract data.
          </p>
          
          <label className="btn-primary" style={{ display: 'inline-block', position: 'relative' }}>
            {loading ? 'Processing...' : 'Choose File / Take Photo'}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              disabled={loading}
            />
          </label>
          
          {ocrProgress && (
            <div style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--primary)' }}>
              {ocrProgress}
            </div>
          )}
        </section>

        {/* Results / Form Section */}
        {result && (
          <section className="glass animate-fade-in" style={{ padding: '20px', border: '1px solid var(--primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <CheckCircle2 color="var(--primary)" size={20} />
              <h4 style={{ fontWeight: '600' }}>Scan Results</h4>
            </div>
            <div style={{ marginBottom: '12px' }}>
              <span className="glass" style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--accent)' }}>
                CATEGORY: {result.category}
              </span>
            </div>
            <div style={{ 
              background: 'rgba(0,0,0,0.2)', 
              padding: '12px', 
              borderRadius: '8px', 
              fontSize: '0.85rem', 
              maxHeight: '150px', 
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
              color: 'var(--text-muted)'
            }}>
              {result.text}
            </div>
            <button className="btn-primary" style={{ width: '100%', marginTop: '16px' }}>
              Confirm & Save Report
            </button>
          </section>
        )}

        {/* Manual Form */}
        <section className="glass" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} /> Manual Entry
          </h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Patient Name / ID</label>
              <input className="glass" style={{ padding: '12px', border: 'none', color: 'white' }} placeholder="Enter ID" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Symptoms / Observations</label>
              <textarea className="glass" style={{ padding: '12px', border: 'none', color: 'white', minHeight: '80px' }} placeholder="Describe findings..." />
            </div>
            <button type="button" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={18} /> Submit Report
            </button>
          </form>
        </section>

      </div>
    </Layout>
  );
};

export default ReportsPage;
