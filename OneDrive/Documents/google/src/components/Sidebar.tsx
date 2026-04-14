import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Activity, Map, Users, PhoneCall, Bell, FileText, 
  LayoutDashboard, ChevronLeft, ChevronRight, Settings,
  User as UserIcon, LogOut, ShieldAlert, CheckCircle2,
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import OTPModal from './OTPModal'; // Reusing our existing OTP modal for password change
import { useRouter } from 'next/router';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const NavItem = ({ icon, label, href }: { icon: React.ReactNode; label: string; href?: string; onClick?: () => void }) => {
    const isActive = router.pathname === href;
    const content = (
      <div 
        style={{
          display: 'flex', alignItems: 'center', gap: '16px', padding: '12px',
          borderRadius: '12px', cursor: 'pointer', transition: 'all 0.3s',
          background: isActive ? 'linear-gradient(90deg, rgba(0, 114, 255, 0.2), transparent)' : 'transparent',
          borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
          color: isActive ? 'var(--primary)' : 'var(--text-muted)'
        }}
        className="hover:bg-white/5 hover:text-white"
      >
        <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center', filter: isActive ? 'drop-shadow(0 0 8px rgba(0,114,255,0.5))' : 'none' }}>
          {icon}
        </div>
        <span style={{ 
          fontSize: '0.9rem', fontWeight: isActive ? '600' : '400',
          whiteSpace: 'nowrap', opacity: isExpanded ? 1 : 0, 
          transform: isExpanded ? 'translateX(0)' : 'translateX(-10px)',
          transition: 'all 0.3s ease', display: isExpanded ? 'block' : 'none'
        }}>
          {label}
        </span>
      </div>
    );

    return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content;
  };

  const handleLogout = () => {
    logout();
    router.push('/auth');
  };

  return (
    <>
      {showOTP && <OTPModal onClose={() => setShowOTP(false)} />}

      <aside className="glass" style={{
        position: 'fixed',
        left: 0, top: 0, bottom: 0,
        width: isExpanded ? '260px' : '80px',
        transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        zIndex: 1000,
        display: 'flex', flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        overflowX: 'hidden'
      }}>
        {/* Header / Logo */}
        <div style={{ 
          padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', 
          borderBottom: '1px solid rgba(255,255,255,0.05)', minHeight: '80px' 
        }}>
          <div style={{
            minWidth: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary), #00A6FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(0,114,255,0.4)', flexShrink: 0
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" style={{ width: '18px' }}><path d="M12 2v20M2 12h20" strokeLinecap="round" /></svg>
          </div>
          <h1 style={{ 
            fontSize: '1.2rem', fontWeight: 'bold', margin: 0,
            opacity: isExpanded ? 1 : 0, transition: 'opacity 0.3s',
            whiteSpace: 'nowrap'
          }} className="text-gradient-primary">
            HealthGap AI
          </h1>
        </div>

        {/* Toggle Collapse Button */}
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            position: 'absolute', top: '27px', right: isExpanded ? '10px' : '-16px',
            background: 'var(--surface-border)', border: 'none', color: 'white',
            width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s', zIndex: 10
          }}
          className="hover:bg-primary"
        >
          {isExpanded ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
        </button>

        {/* Navigation Links */}
        <div style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', opacity: isExpanded ? 1 : 0, transition: 'opacity 0.2s' }}>Menu</div>
          
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" href="/" />
          
          <NavItem icon={<PhoneCall size={20} />} label="Telemedicine" href="/telemedicine" />

          {user.role === 'worker' && (
            <>
              <NavItem icon={<Map size={20} />} label="Global Map" href="/map" />
              <NavItem icon={<Activity size={20} />} label="Reports" href="/reports" />
              <NavItem icon={<Users size={20} />} label="Personnel" href="/workers" />
              <NavItem icon={<FileText size={20} />} label="Prescriptions" href="/prescription" />
              <NavItem icon={<Bell size={20} />} label="System Alerts" href="/alerts" />
            </>
          )}

          {/* Settings Sub-menu logic */}
          <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            
            <div onClick={() => setShowSettings(!showSettings)}>
              <NavItem icon={<Settings size={20} />} label="Settings & Config" />
            </div>

            {/* Injected Collapsible Settings Panel */}
            <div style={{
              overflow: 'hidden', transition: 'max-height 0.3s ease',
              maxHeight: (showSettings && isExpanded) ? '400px' : '0px'
            }}>
              <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', marginTop: '8px' }}>
                
                {/* Profile Display */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserIcon size={18} color="white" />
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--primary)', textTransform: 'uppercase' }}>{user.role}</div>
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                {/* Settings Features */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Toggle Component */}
                  {[
                    { key: 'notifs', label: 'Push Notifications', default: true },
                    { key: 'gps', label: 'Live GPS Tracking', default: false },
                    { key: 'sound', label: 'Sound Attributes', default: true },
                    { key: 'data', label: 'Data Saver Mode', default: false }
                  ].map((setting) => {
                    // Local state hook workaround mapped conceptually
                    const [on, setOn] = React.useState(setting.default);
                    
                    return (
                      <div key={setting.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setOn(!on)}>
                        <span style={{ fontSize: '0.8rem', color: on ? 'white' : 'var(--text-muted)', transition: 'color 0.2s' }}>
                          {setting.label}
                        </span>
                        
                        {/* Custom Switch UI */}
                        <div style={{
                          width: '32px', height: '18px', borderRadius: '10px',
                          background: on ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                          position: 'relative', transition: 'all 0.3s'
                        }}>
                          <div style={{
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: 'white', position: 'absolute', top: '2px',
                            left: on ? '16px' : '2px', transition: 'all 0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                  
                </div>

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)' }} />

                <button 
                  onClick={() => setShowOTP(true)}
                  className="btn-primary flex items-center justify-center gap-2" 
                  style={{ padding: '8px', fontSize: '0.8rem', borderRadius: '8px', cursor: 'pointer' }}
                >
                  <Lock size={14} /> Change Password
                </button>

              </div>
            </div>

            <div onClick={handleLogout} style={{ marginTop: '8px' }}>
              <NavItem icon={<LogOut size={20} />} label="Logout" />
            </div>

          </div>
        </div>
      </aside>
    </>
  );
}
