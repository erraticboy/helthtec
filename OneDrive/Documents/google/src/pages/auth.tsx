import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth, Role } from '@/context/AuthContext';
import { Activity, ShieldCheck, User as UserIcon, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import OTPModal from '@/components/OTPModal';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('user');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  
  const { login } = useAuth();
  const router = useRouter();

  // Generate deterministic particles for background effect
  const [particles, setParticles] = useState([...Array(20)]);
  useEffect(() => {
    setParticles(particles.map(() => ({
      left: Math.random() * 100,
      width: Math.random() * 150 + 50,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    })));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    setIsSubmitting(true);

    // Simulate network delay for UI loading spinner effect
    setTimeout(() => {
      if (!isLogin && name) {
        const authError = login(email, password, role, name);
        if (authError) {
          setError(authError);
          setIsSubmitting(false);
        } else {
          router.push('/');
        }
      } else {
        const authError = login(email, password);
        if (authError) {
          setError(authError);
          setIsSubmitting(false);
        } else {
          router.push('/');
        }
      }
    }, 1500); // 1.5 second artificial delay
  };

  const handleSocialLogin = () => {
    setError("Social Authentication is a demo UI. Please use Email Signup.");
  };

  const handleDemoLogin = (targetRole: Role) => {
    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      // Attempt to login directly first
      const email = targetRole === 'user' ? 'patient@demo.com' : 'worker@demo.com';
      const name = targetRole === 'user' ? 'Patient Zero' : 'Dr. Worker';
      const pw = 'demo';
      
      const loginError = login(email, pw);
      
      // If the account doesn't exist yet, create it on the fly!
      if (loginError) {
        const createError = login(email, pw, targetRole, name);
        if (createError) {
          setError(createError);
          setIsSubmitting(false);
          return;
        }
      }
      
      router.push('/');
    }, 1000);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #111a2f 0%, #050810 100%)',
      padding: '20px',
      position: 'relative'
    }}>
      <Head>
        <title>{isLogin ? 'Sign In' : 'Sign Up'} | HealthGap AI</title>
      </Head>

      {/* Animated Subtle Particles Background */}
      <div className="particles-bg">
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

      {showOTP && <OTPModal onClose={() => setShowOTP(false)} />}

      {/* Centered Glassmorphic Login Card */}
      <div className="glass animate-fade-in" style={{
        width: '100%',
        maxWidth: '430px',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        position: 'relative',
        zIndex: 10
      }}>
        
        {/* Title and Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            width: '60px', height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary), #00A6FF)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 10px 20px rgba(0, 114, 255, 0.3)'
          }}>
            <Activity size={32} color="white" />
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0 0 8px 0', letterSpacing: '-0.5px' }} className="text-gradient-primary">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>
            {isLogin ? 'Access your dashboard securely.' : 'Join the remote healthcare network.'}
          </p>
        </div>

        {error && (
          <div className="animate-fade-in" style={{
            padding: '12px', background: 'rgba(255,51,102,0.1)', color: 'var(--accent)', 
            borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <ShieldAlert size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Role selection for signup only */}
          {!isLogin && (
            <div style={{ display: 'flex', gap: '10px', background: 'rgba(0,0,0,0.3)', padding: '5px', borderRadius: '12px' }}>
              <button 
                type="button"
                onClick={() => setRole('user')}
                aria-pressed={role === 'user'}
                style={{
                  flex: 1, padding: '10px', border: 'none',
                  background: role === 'user' ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: role === 'user' ? 'white' : 'var(--text-muted)',
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontWeight: role === 'user' ? 'bold' : 'normal'
                }}>
                <UserIcon size={16} /> Patient
              </button>
              <button 
                type="button"
                onClick={() => setRole('worker')}
                aria-pressed={role === 'worker'}
                style={{
                  flex: 1, padding: '10px', border: 'none',
                  background: role === 'worker' ? 'rgba(0, 114, 255, 0.2)' : 'transparent',
                  color: role === 'worker' ? 'var(--primary)' : 'var(--text-muted)',
                  borderRadius: '8px', cursor: 'pointer', transition: 'all 0.3s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  fontWeight: role === 'worker' ? 'bold' : 'normal'
                }}>
                <ShieldCheck size={16} /> Doctor
              </button>
            </div>
          )}

          {!isLogin && (
            <div className="floating-group">
              <input
                type="text"
                className="floating-input"
                placeholder=" "
                value={name}
                id="fullNameInput"
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
              <label htmlFor="fullNameInput" className="floating-label">Full Name</label>
            </div>
          )}

          {/* Email Floating Input */}
          <div className="floating-group">
            <input
              type="email"
              className="floating-input"
              placeholder=" "
              id="emailInput"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label htmlFor="emailInput" className="floating-label">Email Address</label>
          </div>

          {/* Password Floating Input with Reveal Toggle */}
          <div className="floating-group" style={{ position: 'relative' }}>
            <input
              type={showPassword ? "text" : "password"}
              className="floating-input"
              placeholder=" "
              id="passwordInput"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ letterSpacing: (!showPassword && password) ? '4px' : 'normal', paddingRight: '48px' }}
            />
            <label htmlFor="passwordInput" className="floating-label">Password</label>
            
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
              }}
              className="hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '-5px' }}>
            {/* Remember Me Custom Checkbox Interaction */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}>
              <input 
                 type="checkbox" 
                 checked={rememberMe} 
                 onChange={(e) => setRememberMe(e.target.checked)} 
                 style={{ accentColor: 'var(--primary)', cursor: 'pointer', width: '16px', height: '16px' }}
              />
              Remember Me
            </label>
            
            {isLogin && (
              <button 
                type="button" 
                onClick={() => setShowOTP(true)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.85rem', cursor: 'pointer', fontWeight: '500' }}
                className="hover:text-white transition-colors"
              >
                Forgot Password?
              </button>
            )}
          </div>

          {/* Animated Submit Button */}
          <button type="submit" disabled={isSubmitting} className="btn-primary" style={{
            padding: '16px', borderRadius: '12px', fontSize: '1rem', fontWeight: 'bold',
            marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '54px', opacity: isSubmitting ? 0.8 : 1
          }}>
            {isSubmitting ? <div className="loading-spinner" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        {/* Social Login Integrations (Visual Demo) */}
        <div style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Or continue with</span>
            <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={handleSocialLogin} type="button" style={{
              flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s'
            }} className="hover:bg-white/5">
               <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg> Google
            </button>
            <button onClick={handleSocialLogin} type="button" style={{
              flex: 1, padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.3s'
            }} className="hover:bg-white/5">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg> GitHub
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s'
            }}
            className="hover:text-white"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
