import React, { useState, useRef } from 'react';
import Layout from '@/components/Layout';
import { Plus, Trash2, Sparkles, ArrowLeft, Printer, Download, User, Clipboard, UserCircle, FileText, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';

interface Medicine {
  name: string;
  dosage: string;
  instructions: string;
}

const PrescriptionPage = () => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const [patient, setPatient] = useState({ name: '', age: '', gender: 'Male' });
  const [symptoms, setSymptoms] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [doctorName, setDoctorName] = useState('Dr. Sarah Chen');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const addMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', instructions: '' }]);
  };

  const removeMedicine = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof Medicine, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleAiSuggest = async () => {
    if (!symptoms.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/suggest-medicine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          symptoms,
          name: patient.name,
          age: patient.age
        }),
      });
      const data = await res.json();
      if (data.medicines) {
        setMedicines([...medicines, ...data.medicines]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(false);
    }
  };


  const handlePrint = useReactToPrint({
    contentRef: contentRef,
    documentTitle: `Prescription_${patient.name || 'Patient'}`,
  });

  const handleDownloadPdf = () => {
    // using react-to-print for PDF generates a proper vector PDF via the browser's native print engine
    handlePrint();
  };

  return (
    <Layout title="AI Prescription | HealthGap AI">
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body { 
            background: #0a0f19 !important; 
            color: #ffffff !important;
            margin: 0;
            padding: 0;
          }
          #prescription-to-print {
            box-shadow: none !important;
            border: 1px solid #00d1ff !important;
            padding: 20px !important;
            color: #ffffff !important;
            background: #0a0f19 !important;
          }
          #prescription-to-print * {
            color: #ffffff !important;
            text-shadow: none !important;
            box-shadow: none !important;
          }
          #prescription-to-print h1, #prescription-to-print h3, #prescription-to-print th, .signature {
            color: #00d1ff !important;
          }
          .glass {
            background: rgba(255, 255, 255, 0.05) !important;
            backdrop-filter: none !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .no-print {
             display: none !important;
          }
        }
      `}} />
      <AnimatePresence mode="wait">
        {mode === 'edit' ? (
          <motion.div 
            key="edit"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ paddingBottom: '100px' }}
          >
            <section className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <UserCircle size={32} color="var(--primary)" />
                <h2 style={{ fontSize: '1.4rem' }}>Patient Details</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="input-field">
                  <label>Full Name</label>
                  <input value={patient.name} onChange={e => setPatient({...patient, name: e.target.value})} placeholder="e.g. John Doe" />
                </div>
                <div className="input-field">
                  <label>Age</label>
                  <input type="number" value={patient.age} onChange={e => setPatient({...patient, age: e.target.value})} placeholder="e.g. 45" />
                </div>
              </div>
            </section>

            <section className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Clipboard size={28} color="var(--accent)" />
                  <h2 style={{ fontSize: '1.4rem' }}>Symptoms & Analysis</h2>
                </div>
                <button 
                  onClick={handleAiSuggest}
                  disabled={isAiLoading}
                  className="btn-ai"
                >
                  {isAiLoading ? <span className="loader"></span> : <Sparkles size={16} />}
                  <span>AI Assist</span>
                </button>
              </div>
              <textarea 
                value={symptoms} 
                onChange={e => setSymptoms(e.target.value)}
                placeholder="Describe symptoms for AI drafting..."
                style={{ width: '100%', height: '120px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--surface-border)', borderRadius: '12px', padding: '12px', color: 'white', outline: 'none' }}
              />
            </section>

            <section className="glass" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '1.4rem' }}>Medications</h2>
                <button onClick={addMedicine} className="btn-secondary"><Plus size={18} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {medicines.map((med, idx) => (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }}
                    key={idx} 
                    className="glass" 
                    style={{ padding: '16px', position: 'relative' }}
                  >
                    <button onClick={() => removeMedicine(idx)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: 'var(--secondary)' }}><Trash2 size={16} /></button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div className="input-field">
                        <label>Medicine Name</label>
                        <input value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} />
                      </div>
                      <div className="input-field">
                        <label>Dosage</label>
                        <input value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} />
                      </div>
                    </div>
                    <div className="input-field" style={{ marginTop: '12px' }}>
                      <label>Instructions</label>
                      <input value={med.instructions} onChange={e => updateMedicine(idx, 'instructions', e.target.value)} />
                    </div>
                  </motion.div>
                ))}
                {medicines.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No medicines added yet.</p>}
              </div>
            </section>

            <div style={{ padding: '0 10px' }}>
              <button 
                onClick={() => setMode('preview')} 
                className="btn-primary" 
                style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
              >
                Generate Preview
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{ paddingBottom: '120px' }}
          >
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              <button onClick={() => setMode('edit')} className="glass" style={{ padding: '12px', border: 'none' }}><ArrowLeft size={20} /></button>
              <h2 style={{ alignSelf: 'center' }}>Prescription Preview</h2>
            </div>
            
            <div ref={contentRef} id="prescription-to-print" className="prescription-paper animate-fade-in" style={{ padding: '40px', background: 'rgba(10, 15, 25, 0.95)' }}>
              <div className="watermark" style={{ display: 'none' }}>HEALTHGAP</div>
              <header style={{ borderBottom: '2px solid var(--primary)', paddingBottom: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <h1 style={{ color: 'var(--primary)', letterSpacing: '2px', fontSize: '1.8rem' }}>HealthGap AI</h1>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Digital Healthcare Intervention Unit</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '700' }}>{doctorName}</p>
                  <p style={{ fontSize: '0.7rem' }}>Reg No: HG-2910-X</p>
                </div>
              </header>

              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}><strong>Patient:</strong> {patient.name || 'N/A'}</p>
                <p style={{ fontSize: '0.9rem' }}><strong>Age/Gender:</strong> {patient.age || 'N/A'} • {patient.gender}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>Date: {new Date().toLocaleDateString()}</p>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '4px', marginBottom: '12px' }}>Symptoms</h3>
                <p style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>{symptoms || 'None reported'}</p>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '4px', marginBottom: '16px' }}>Rx (Medications)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--primary)' }}>
                      <th style={{ paddingBottom: '8px' }}>Medicine</th>
                      <th style={{ paddingBottom: '8px' }}>Dosage</th>
                      <th style={{ paddingBottom: '8px' }}>Timings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem' }}>
                        <td style={{ padding: '12px 0' }}>{med.name}</td>
                        <td>{med.dosage}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{med.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <footer style={{ marginTop: '60px', borderTop: '1px solid var(--surface-border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '0.65rem' }}>
                  <p>● This is a digitally generated prescription.</p>
                  <p>● Validated by HealthGap AI Protocol v2.4</p>
                </div>
                <div style={{ textAlign: 'center', minWidth: '200px' }}>
                  <div className="signature">{doctorName}</div>
                  <div style={{ borderTop: '1px solid white', width: '100%', paddingTop: '4px', fontSize: '0.7rem' }}>Authorized Signature</div>
                </div>
              </footer>
            </div>

            <div className="no-print" style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <button onClick={() => handlePrint()} className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Printer size={20}/> Print</button>
              <button onClick={handleDownloadPdf} className="glass" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--accent)' }}><FileText size={20}/> Save as PDF</button>
              <button onClick={() => {
                const element = document.getElementById('prescription-to-print');
                if (!element) return;
                setIsAiLoading(true);
                html2canvas(element, { scale: 3, useCORS: true, backgroundColor: '#0a0f19' }).then(canvas => {
                  const link = document.createElement('a');
                  link.download = `Prescription_${patient.name || 'Patient'}.jpg`;
                  link.href = canvas.toDataURL('image/jpeg', 0.9);
                  link.click();
                  setIsAiLoading(false);
                });
              }} className="btn-primary" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Download size={20}/> JPG Image</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .input-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .input-field label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 600;
        }
        .input-field input {
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--surface-border);
          border-radius: 8px;
          padding: 10px;
          color: white;
          outline: none;
        }
        .input-field input:focus {
          border-color: var(--primary);
        }
        .btn-ai {
          background: linear-gradient(135deg, var(--primary), var(--secondary));
          border: none;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(255, 71, 126, 0.3);
        }
        .btn-secondary {
          background: var(--surface);
          border: 1px solid var(--surface-border);
          color: white;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
        }
        .prescription-paper {
          background: rgba(10, 15, 25, 0.95);
          border: 1px solid var(--primary);
          border-radius: 4px;
          padding: 40px;
          min-height: 500px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0, 209, 255, 0.1);
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 6rem;
          font-weight: 900;
          color: rgba(255,255,255,0.03);
          pointer-events: none;
          z-index: 0;
        }
        .signature {
          font-family: 'Brush Script MT', cursive;
          font-size: 2rem;
          color: var(--primary);
          margin-bottom: -10px;
        }
        .loader {
          width: 14px;
          height: 14px;
          border: 2px solid #FFF;
          border-bottom-color: transparent;
          border-radius: 50%;
          display: inline-block;
          animation: rotation 1s linear infinite;
        }
        @keyframes rotation {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Layout>
  );
};

export default PrescriptionPage;
