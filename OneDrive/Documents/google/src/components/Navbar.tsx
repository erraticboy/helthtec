import React from 'react';
import Link from 'next/link';
import { Activity, Map, Users, PhoneCall, Bell, FileText, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="glass" style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '95%',
      maxWidth: '450px',
      height: '70px',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '0 10px',
      zIndex: 1000,
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
    }}>
      <NavItem icon={<LayoutDashboard size={24} />} label="Home" href="/" />
      
      {user.role === 'worker' && (
        <>
          <NavItem icon={<Activity size={24} />} label="Reports" href="/reports" />
          <NavItem icon={<Users size={24} />} label="Workers" href="/workers" />
          <NavItem icon={<PhoneCall size={24} />} label="Telemed" href="/telemedicine" />
          <NavItem icon={<FileText size={24} />} label="Prescribe" href="/prescription" />
          <NavItem icon={<Bell size={24} />} label="Alerts" href="/alerts" />
        </>
      )}
    </nav>
  );
};

const NavItem = ({ icon, label, href, active = false }: { icon: React.ReactNode, label: string, href: string, active?: boolean }) => (
  <Link href={href} style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: active ? 'var(--primary)' : 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  }}>
    <div style={{
      filter: active ? 'drop-shadow(0 0 8px var(--primary-glow))' : 'none',
      transform: active ? 'scale(1.1)' : 'scale(1)'
    }}>
      {icon}
    </div>
    <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400' }}>{label}</span>
  </Link>
);

export default Navbar;
