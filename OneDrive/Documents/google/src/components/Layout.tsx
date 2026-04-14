import React from 'react';
import Sidebar from './Sidebar';
import Head from 'next/head';
import { useAuth } from '@/context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'HealthGap AI' }) => {
  const { user } = useAuth();
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
      <Head>
        <title>{title}</title>
        <meta name="description" content="AI-Powered Last-Mile Healthcare Gap Detection" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </Head>

      {user && <Sidebar />}

      <div style={{ flex: 1, paddingLeft: user ? '260px' : '0', transition: 'padding-left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)' }}>
        {/* Responsive top status bar */}
        {user && (
           <div style={{ 
             display: 'flex', justifyContent: 'flex-end', padding: '16px 24px',
             borderBottom: '1px solid rgba(255,255,255,0.02)'
           }}>
             <div className="glass" style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: 'var(--primary)' }}>
                Live: Rural Zone A
             </div>
           </div>
        )}
        
        <main className="animate-fade-in" style={{ padding: '24px' }}>
          {children}
        </main>
      </div>

    </div>
  );
};

export default Layout;
