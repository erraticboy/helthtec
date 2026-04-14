import Head from "next/head";
import dynamic from "next/dynamic";
import Layout from "@/components/Layout";
import { AlertCircle, TrendingUp, Zap, Activity, ShieldAlert, BarChart3, Users, CheckCircle, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from "@/context/AuthContext";
import { useDb } from "@/context/DatabaseContext";
import { useRouter } from "next/router";
import UserDashboard from "@/components/UserDashboard";
import ChatInterface from "@/components/ChatInterface";

const GapMap = dynamic(() => import("@/components/GapMap"), { 
  ssr: false,
  loading: () => <div className="glass" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Maps...</div>
});

const diseaseTrendsData = [
  { name: 'Mon', malaria: 12, typhoid: 5 },
  { name: 'Tue', malaria: 19, typhoid: 8 },
  { name: 'Wed', malaria: 15, typhoid: 12 },
  { name: 'Thu', malaria: 22, typhoid: 9 },
  { name: 'Fri', malaria: 30, typhoid: 15 },
  { name: 'Sat', malaria: 28, typhoid: 11 },
  { name: 'Sun', malaria: 35, typhoid: 18 },
];

const resourceAllocationData = [
  { name: 'Medication', allocated: 80, required: 100 },
  { name: 'Personnel', allocated: 40, required: 60 },
  { name: 'Tests', allocated: 90, required: 85 },
  { name: 'Vehicles', allocated: 20, required: 50 },
];

export default function Home() {
  const [mapMode, setMapMode] = useState<'streets' | 'satellite'>('streets');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [targetWorkerId, setTargetWorkerId] = useState<string | undefined>(undefined);
  const [targetPatientId, setTargetPatientId] = useState<string | undefined>(undefined);
  
  const { user, isLoading } = useAuth();
  const { problems, resolveProblem } = useDb();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0B1121', color: 'var(--primary)' }}>Loading Identity...</div>;
  }

  return (
    <Layout>
      <Head>
        <title>HealthGap AI | {user.role === 'worker' ? 'Command Center' : 'Patient Portal'}</title>
      </Head>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="glass-hover"
        style={{
          position: 'fixed', bottom: '30px', right: '30px', zIndex: 999,
          width: '60px', height: '60px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--primary), #00A6FF)',
          border: 'none', boxShadow: '0 10px 25px rgba(0, 114, 255, 0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer'
        }}
      >
        <MessageSquare size={28} />
      </button>

      {isChatOpen && <ChatInterface onClose={() => setIsChatOpen(false)} targetWorkerId={targetWorkerId} targetUserId={targetPatientId} />}

      {user.role === 'user' ? (
        <UserDashboard openChat={(workerId) => {
          if (workerId) {
            router.push(`/telemedicine?target=${workerId}`);
          } else {
            router.push(`/telemedicine`);
          }
        }} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Header */}
          <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }} className="text-gradient-primary">Command Center</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>Real-time spatial tracking & AI analytics (Dr. {user.name})</p>
            </div>
          </section>

          {/* Incoming Problem Reports Section */}
          <section className="glass animate-fade-in" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Users size={20} color="var(--primary)" />
              Live Patient Requests
            </h3>
            
            {problems.filter(p => p.status === 'pending').length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>No pending requests.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {problems.filter(p => p.status === 'pending').map(p => (
                  <div key={p.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <strong style={{ color: 'white' }}>{p.userName}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(p.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 12px 0' }}>{p.description}</p>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => { setTargetPatientId(p.userId); setIsChatOpen(true); }} className="btn-primary" style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '0.8rem' }}>Contact Patient</button>
                      <button onClick={() => resolveProblem(p.id)} style={{ flex: 1, padding: '8px', borderRadius: '6px', fontSize: '0.8rem', background: 'rgba(0, 255, 0, 0.1)', color: '#00ff00', border: '1px solid rgba(0, 255, 0, 0.2)', cursor: 'pointer' }}>Resolve</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Global Key Metrics Grid */}
          <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <StatCard icon={<AlertCircle size={20} color="var(--secondary)" />} label="Critical Gaps" value="12" trend="+2 this week" />
            <StatCard icon={<Zap size={20} color="var(--primary)" />} label="Active Units" value="08" trend="4 mobile clinics" />
            <StatCard icon={<Activity size={20} color="var(--accent)" />} label="Total Cases" value="249" trend="+14% vs last wk" />
          </section>

          {/* --- MAP SECTION --- */}
          <section className="glass animate-fade-in" style={{ padding: '8px', animationDelay: '0.1s' }}>
            <div style={{ padding: '8px 12px 16px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={18} color="var(--primary)"/> Live Heatmap & Patients
              </h3>
              <div className="glass" style={{ padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
               <button onClick={() => setMapMode('streets')} className={mapMode === 'streets' ? "btn-primary" : "glass"} style={{ padding: '6px 12px', fontSize: '0.7rem', border: 'none' }}>Streets</button>
               <button onClick={() => setMapMode('satellite')} className={mapMode === 'satellite' ? "btn-primary" : "glass"} style={{ padding: '6px 12px', fontSize: '0.7rem', border: 'none' }}>Satellite</button>
              </div>
            </div>
            <div style={{ borderRadius: '12px', overflow: 'hidden' }}>
              <GapMap isSatellite={mapMode === 'satellite'} />
            </div>
          </section>

          {/* --- ANALYTICS SECTION --- */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <BarChart3 size={24} color="var(--primary)" />
            <h2 style={{ fontSize: '1.4rem' }}>Advanced Analytics</h2>
          </div>

          <section className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '16px', animationDelay: '0.2s' }}>
            <div className="glass" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Disease Outbreak Trends</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={diseaseTrendsData}>
                    <defs>
                      <linearGradient id="colorMalaria" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTyphoid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip 
                      contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--foreground)' }}
                    />
                    <Area type="monotone" dataKey="malaria" stroke="var(--primary)" fillOpacity={1} fill="url(#colorMalaria)" />
                    <Area type="monotone" dataKey="typhoid" stroke="var(--secondary)" fillOpacity={1} fill="url(#colorTyphoid)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="glass" style={{ padding: '20px' }}>
              {/* Omitted Resource Block for brevity but can keep it */}
              <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text-muted)' }}>Resource Fulfillment</h3>
              <div style={{ height: '220px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceAllocationData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                    <RechartsTooltip cursor={{fill: 'var(--surface-hover)'}} contentStyle={{ background: 'var(--glass-bg)', border: '1px solid var(--surface-border)', borderRadius: '8px' }} />
                    <Bar dataKey="allocated" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="required" fill="rgba(255, 255, 255, 0.2)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* AI Intelligence Report */}
          <section className="glass animate-fade-in" style={{ padding: '20px', animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={20} color="var(--accent)" /> AI Intelligence Report
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <RecommendationItem title="Malaria Spike Detected" zone="Zone Alpha" action="Deploy Mobile Clinic" urgency="HIGH" />
            </div>
          </section>

        </div>
      )}
    </Layout>
  );
}

const StatCard = ({ icon, label, value, trend }: any) => (
  <div className="glass glass-hover" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {icon}
      <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>{label}</span>
    </div>
    <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>{value}</div>
    <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>{trend}</div>
  </div>
);

const RecommendationItem = ({ title, zone, action, urgency }: any) => (
  <div style={{ 
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '12px', 
    background: 'rgba(255,255,255,0.02)', borderLeft: `4px solid ${urgency === 'HIGH' ? 'var(--secondary)' : 'var(--accent)'}`
  }}>
    <div>
      <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '4px', color: 'white' }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{zone} • {action}</div>
    </div>
    <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem', borderRadius: '8px' }}>Resolve</button>
  </div>
);
