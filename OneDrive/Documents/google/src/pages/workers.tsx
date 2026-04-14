import React from 'react';
import Layout from '@/components/Layout';
import { User, MapPin, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

const WORKERS = [
  { id: 1, name: 'Dr. Sarah Chen', role: 'Physician', location: 'Rural Zone A', status: 'Available', skills: ['Emergency', 'Surgery'] },
  { id: 2, name: 'James Wilson', role: 'Nurse Practitioner', location: 'Zone Beta', status: 'Busy', skills: ['Maternal Care', 'Vaccination'] },
  { id: 3, name: 'Anita Roy', role: 'Paramedic', location: 'Zone Gamma', status: 'On Route', skills: ['First Aid', 'Trauma'] },
];

const WorkersPage = () => {
  return (
    <Layout title="Worker Management | HealthGap AI">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Health Workers</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage and match deployable medical personnel.</p>
        </section>

        {/* Worker List */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {WORKERS.map((worker) => (
            <div key={worker.id} className="glass glass-hover" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ 
                    width: '50px', 
                    height: '50px', 
                    borderRadius: '12px', 
                    background: 'var(--surface-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <User size={28} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>{worker.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>{worker.role}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <MapPin size={12} /> {worker.location}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  padding: '4px 8px', 
                  borderRadius: '20px', 
                  background: worker.status === 'Available' ? 'rgba(0,255,100,0.1)' : 'rgba(255,100,0,0.1)',
                  color: worker.status === 'Available' ? '#00ff64' : '#ff6400',
                  fontWeight: '600'
                }}>
                  {worker.status}
                </div>
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {worker.skills.map((skill) => (
                  <span key={skill} style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(255,255,255,0.05)', 
                    padding: '4px 10px', 
                    borderRadius: '4px',
                    border: '1px solid var(--surface-border)'
                  }}>
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '10px' }}>Deploy to Gap</button>
                <button className="glass" style={{ border: '1px solid var(--surface-border)', fontSize: '0.8rem', padding: '10px' }}>View Profile</button>
              </div>
            </div>
          ))}
        </section>

        {/* Recruitment Card */}
        <section className="glass animate-fade-in" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(0, 209, 255, 0.05) 0%, rgba(255, 71, 126, 0.05) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <ShieldCheck color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem' }}>Smart Matching AI</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Our AI automatically matches health workers based on their specialized skills and proximity to newly detected critical gaps.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', gap: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>24</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Workers Near High Risk</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--accent)' }}>02</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Direct Deployments</div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default WorkersPage;
