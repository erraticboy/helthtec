import React from 'react';
import Layout from '@/components/Layout';
import { Bell, AlertTriangle, Info, CheckCircle, MapPin } from 'lucide-react';

const ALERTS = [
  { id: 1, type: 'CRITICAL', title: 'New Gap Detected', message: 'Zone Gamma shows 40% decrease in available doctors.', time: '2 mins ago', icon: <AlertTriangle color="var(--secondary)" /> },
  { id: 2, type: 'URGENT', title: 'Intervention Required', message: 'Deployment of Mobile Clinic #4 in Zone Alpha is overdue.', time: '1 hour ago', icon: <MapPin color="var(--accent)" /> },
  { id: 3, type: 'INFO', title: 'Worker Availability', message: '3 new volunteers have joined the network in Zone Beta.', time: '5 hours ago', icon: <Info color="var(--primary)" /> },
];

const AlertsPage = () => {
  return (
    <Layout title="Alerts | HealthGap AI">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Action Center</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time notifications for healthcare gap escalation.</p>
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {ALERTS.map((alert) => (
            <div key={alert.id} className="glass glass-hover" style={{ 
              padding: '16px', 
              display: 'flex', 
              gap: '16px',
              borderLeft: `4px solid ${alert.type === 'CRITICAL' ? 'var(--secondary)' : alert.type === 'URGENT' ? 'var(--accent)' : 'var(--primary)'}`
            }}>
              <div style={{ padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                {alert.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: '700' }}>{alert.title}</h3>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{alert.time}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{alert.message}</p>
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.7rem', borderRadius: '6px' }}>View Details</button>
                  <button className="glass" style={{ padding: '4px 12px', fontSize: '0.7rem', borderRadius: '6px', border: '1px solid var(--surface-border)' }}>Dismiss</button>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="glass" style={{ padding: '20px', textAlign: 'center' }}>
          <CheckCircle size={32} color="#00ff64" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1rem' }}>All systems operational</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Syncing with 4 regional servers in real-time.</p>
        </section>
      </div>
    </Layout>
  );
};

export default AlertsPage;
