import React, { useState, useEffect } from 'react';
import { useDb } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Send, AlertTriangle, MessageSquare, Video, UserPlus, Circle } from 'lucide-react';

export default function UserDashboard({ openChat }: { openChat: (workerId?: string) => void }) {
  const { submitProblem, problems, users } = useDb();
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);

  const myProblems = problems.filter(p => p.userId === user?.id);
  // Get all registered workers
  const availableWorkers = users.filter((u: any) => u.role === 'worker');

  const handleGetLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      }, (err) => {
        alert("Failed to get location.");
        setLocating(false);
      });
    } else {
      setLocating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !user) return;
    
    submitProblem({
      description,
      location,
      userId: user.id,
      userName: user.name
    });
    setDescription('');
    setLocation(null);
  };

  // Generate precise deterministic particles for background effect
  const [particles, setParticles] = useState([...Array(15)]);
  useEffect(() => {
    setParticles(particles.map(() => ({
      left: Math.random() * 100,
      width: Math.random() * 100 + 50,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5
    })));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', minHeight: '80vh' }}>
      
      {/* Background Particles specific to Dashboard space */}
      <div className="particles-bg" style={{ opacity: 0.5 }}>
        {particles.map((p: any, i) => p ? (
          <div key={i} className="particle" style={{
            left: `${p.left}%`,
            width: `${p.width}px`,
            height: `${p.width}px`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`
          }} />
        ) : null)}
      </div>

      <section style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '1.8rem' }} className="text-gradient-primary">Patient Portal</h2>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}</p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', position: 'relative', zIndex: 1 }}>
        
        {/* Actions Hub */}
        <section className="glass animate-fade-in glass-hover" style={{ padding: '24px', transition: 'all 0.3s' }}>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={20} color="var(--accent)" /> Request Assistance
           </h3>
           <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="floating-group">
              <textarea
                placeholder=" "
                id="symptomArea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{
                  width: '100%', padding: '16px', paddingTop: '24px', borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white', resize: 'none', transition: 'all 0.3s'
                }}
                className="floating-input"
              />
              <label htmlFor="symptomArea" className="floating-label">Describe symptoms or need...</label>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button 
                type="button" 
                onClick={handleGetLocation}
                style={{
                  padding: '8px 12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer'
                }}
                className="hover:border-primary transition-all"
              >
                <MapPin size={16} color={location ? 'var(--primary)' : 'currentColor'} /> 
                {locating ? 'Locating...' : location ? 'Location Attached' : 'Attach GPS Location'}
              </button>
              
              <button type="submit" className="btn-primary" style={{ padding: '8px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={16} /> Submit
              </button>
            </div>
           </form>
        </section>

        {/* Global Chat / Doctor Selection UI */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <section className="glass animate-fade-in glass-hover" style={{ padding: '24px', animationDelay: '0.1s', transition: 'all 0.3s' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
               <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Available Specialists</h3>
               <span style={{ fontSize: '0.8rem', background: 'rgba(0,114,255,0.2)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                 <Circle size={8} fill="var(--primary)" color="var(--primary)" /> {availableWorkers.length} Online
               </span>
             </div>
             
             {availableWorkers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                  No specialists are currently online.
                </div>
             ) : (
                <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
                  {availableWorkers.map((worker: any) => (
                    <div key={worker.id} style={{
                      minWidth: '140px', padding: '16px', borderRadius: '16px',
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'transform 0.2s', cursor: 'grab'
                    }} className="hover:bg-white/5">
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <UserPlus size={24} color="white" />
                        </div>
                        <Circle size={12} fill="#00ff00" color="#00ff00" style={{ position: 'absolute', bottom: 0, right: 0, border: '2px solid #000', borderRadius: '50%' }} />
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100px' }}>Dr. {worker.name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Remote Unit</div>
                      </div>
                      <button 
                        onClick={() => openChat(worker.id)} 
                        className="btn-primary" 
                        style={{ width: '100%', padding: '6px', borderRadius: '8px', fontSize: '0.75rem', marginTop: '4px' }}
                      >
                        Consult
                      </button>
                    </div>
                  ))}
                </div>
             )}
             
             <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '16px', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px' }}>
               Specialists can generate secure video consultation links via the chat interface.
             </p>
          </section>

          <section className="glass animate-fade-in glass-hover" style={{ padding: '24px', animationDelay: '0.2s', flex: 1, transition: 'all 0.3s' }}>
             <h3 style={{ fontSize: '1.2rem', marginBottom: '16px' }}>My Requests</h3>
             {myProblems.length === 0 ? (
               <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No requests submitted yet.</div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '250px', overflowY: 'auto' }}>
                 {myProblems.slice().reverse().map(p => (
                   <div key={p.id} style={{ 
                     padding: '12px', borderRadius: '8px', 
                     background: 'rgba(255,255,255,0.03)', borderLeft: `3px solid ${p.status === 'resolved' ? 'var(--primary)' : 'var(--accent)'}`
                   }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                       <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.timestamp).toLocaleDateString()}</span>
                       <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: p.status === 'resolved' ? 'rgba(0,114,255,0.2)' : 'rgba(255,51,102,0.2)', color: p.status === 'resolved' ? 'var(--primary)' : 'var(--accent)' }}>
                         {p.status.toUpperCase()}
                       </span>
                     </div>
                     <p style={{ fontSize: '0.9rem', margin: 0 }}>{p.description}</p>
                   </div>
                 ))}
               </div>
             )}
          </section>

        </div>
      </div>
    </div>
  );
}
