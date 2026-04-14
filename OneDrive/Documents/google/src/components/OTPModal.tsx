import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, ShieldAlert, X } from 'lucide-react';

interface OTPModalProps {
  onClose: () => void;
}

export default function OTPModal({ onClose }: OTPModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [simulatedOTP, setSimulatedOTP] = useState('');
  const [enteredOTP, setEnteredOTP] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [toastOTP, setToastOTP] = useState<string | null>(null);

  const { updatePassword } = useAuth();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check if email exists in our db
    const rawUsers = localStorage.getItem('hg_db_users');
    const dbUsers = rawUsers ? JSON.parse(rawUsers) : [];
    if (!dbUsers.find((u: any) => u.email === email)) {
      setError("Email not registered in the system.");
      return;
    }

    // Generate fake 6 digit OTP
    const generated = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOTP(generated);
    setToastOTP(generated); // Show simulated toast alert containing the OTP
    setStep(2);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOTP !== simulatedOTP) {
      setError("Incorrect OTP code. Please check your email and try again.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    // Validate and update
    updatePassword(email, newPassword);
    alert('Password updated successfully! You can now log in.');
    onClose();
  };

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)' }} onClick={onClose} />
        
        <div className="glass animate-fade-in" style={{ position: 'relative', width: '90%', maxWidth: '400px', padding: '32px', borderRadius: '24px', zIndex: 1001 }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
             <KeyRound size={32} color="var(--primary)" style={{ marginBottom: '16px' }} />
             <h2 style={{ fontSize: '1.4rem', margin: 0 }}>Reset Password</h2>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
               {step === 1 ? 'Enter your email to receive an OTP.' : 'Enter the OTP and your new password.'}
             </p>
          </div>

          {error && (
            <div style={{ padding: '12px', background: 'rgba(255,51,102,0.1)', color: 'var(--accent)', borderRadius: '8px', marginBottom: '16px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} /> {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '12px' }}>Send OTP</button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                placeholder="6-Digit OTP Code"
                value={enteredOTP}
                onChange={(e) => setEnteredOTP(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', letterSpacing: '4px', textAlign: 'center' }}
                maxLength={6}
              />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
              />
              <button type="submit" className="btn-primary" style={{ padding: '12px', borderRadius: '12px' }}>Verify & Reset</button>
            </form>
          )}

        </div>
      </div>

      {/* Simulated Email Toast for Testing */}
      {toastOTP && (
        <div className="animate-fade-in" style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '12px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)', maxWidth: '280px'
        }}>
          <strong>Simulated Email</strong><br/>
          <span style={{ fontSize: '0.9rem' }}>Your HealthGap AI password reset code is: <strong>{toastOTP}</strong></span>
          <button onClick={() => setToastOTP(null)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={14}/></button>
        </div>
      )}
    </>
  );
}
