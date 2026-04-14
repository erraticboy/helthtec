import React, { useState, useEffect, useRef } from 'react';
import Layout from '@/components/Layout';
import { Send, Phone, Video, User, ChevronLeft, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import { useDb } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';

const JitsiCall = ({ roomName, onEnd }: { roomName: string, onEnd: () => void }) => {
  const jitsiContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let api: any = null;
    
    const initJitsi = () => {
      if ((window as any).JitsiMeetExternalAPI) {
        const options = {
          roomName: roomName,
          width: '100%',
          height: '100%',
          parentNode: jitsiContainerRef.current,
          configOverwrite: {
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false
          },
          interfaceConfigOverwrite: {
            TOOLBAR_BUTTONS: [
              'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
              'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
              'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
              'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
              'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
              'security'
            ],
          }
        };
        api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', options);
        api.addEventListener('videoConferenceLeft', onEnd);
      }
    };

    if (!(window as any).JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);
    } else {
      initJitsi();
    }

    return () => {
      if (api) api.dispose();
    };
  }, [roomName, onEnd]);

  return (
    <div ref={jitsiContainerRef} style={{ width: '100%', height: '100%' }} />
  );
};

const TelemedicinePage = () => {
  const router = useRouter();
  const { target } = router.query;
  const { users } = useDb();
  const { user } = useAuth();
  
  // Find the target user we are talking to
  const targetUser = users.find(u => u.id === target) || { name: 'Sarah Chen', role: 'worker' };
  
  const [messages, setMessages] = useState([
    { id: 1, sender: targetUser.role === 'worker' ? `Dr. ${targetUser.name}` : targetUser.name, text: 'Hello! I see you reported some symptoms. How can I help today?', time: '10:00 AM' },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const roomName = `HealthGap-Telemed-${target}-${user?.id}`;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      id: Date.now(),
      sender: user?.name || 'Patient',
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          history: messages.slice(-5) 
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender: targetUser.role === 'worker' ? `Dr. ${targetUser.name}` : targetUser.name,
          text: data.response,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'System',
        text: 'Error: Could not reach the AI Assistant. Please try again later.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Telemedicine | HealthGap AI">
      <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Chat Header */}
        <section className="glass" style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={24} />
              </div>
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px', borderRadius: '50%', background: '#00ff64', border: '2px solid var(--background)' }}></div>
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                {targetUser.role === 'worker' ? `Dr. ${targetUser.name}` : targetUser.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--primary)' }}>
                {targetUser.role === 'worker' ? 'Physician • Online' : 'Patient • In consultation'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="glass glass-hover" onClick={() => setIsCallActive(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
              <Phone size={20} />
            </button>
            <button className="glass glass-hover" onClick={() => setIsCallActive(true)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer' }}>
              <Video size={20} />
            </button>
          </div>
        </section>

        {/* Chat Area */}
        <section className="glass" style={{ 
          flex: 1, 
          overflowY: 'auto', 
          padding: '20px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          marginBottom: '16px',
          background: 'rgba(0,0,0,0.2)'
        }}>
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                style={{ 
                  alignSelf: msg.sender === 'Patient' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%'
                }}
              >
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: msg.sender === 'Patient' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'Patient' ? 'linear-gradient(135deg, var(--primary), #0072ff)' : 'var(--surface)',
                  color: 'white',
                  fontSize: '0.9rem',
                  boxShadow: msg.sender === 'Patient' ? '0 4px 15px var(--primary-glow)' : 'none',
                  border: msg.sender === 'Patient' ? 'none' : '1px solid var(--surface-border)'
                }}>
                  {msg.text}
                </div>
                <div style={{ 
                  fontSize: '0.65rem', 
                  color: 'var(--text-muted)', 
                  marginTop: '4px',
                  textAlign: msg.sender === 'Patient' ? 'right' : 'left'
                }}>
                  {msg.time}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ alignSelf: 'flex-start' }}
            >
              <div className="glass" style={{ padding: '8px 16px', borderRadius: '16px 16px 16px 4px', fontSize: '0.8rem', color: 'var(--primary)' }}>
                <span className="dot-flashing"></span> Dr. Sarah is thinking...
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </section>


        {/* Input Area */}
        <section className="glass" style={{ padding: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message..." 
            style={{ 
              flex: 1, 
              background: 'transparent', 
              border: 'none', 
              padding: '12px', 
              color: 'white',
              fontSize: '0.9rem',
              outline: 'none'
            }} 
          />
          <button 
            onClick={handleSend}
            className="btn-primary" 
            style={{ 
              width: '44px', 
              height: '44px', 
              padding: 0, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Send size={20} />
          </button>
        </section>

        {/* Video Call Overlay */}
        <AnimatePresence>
          {isCallActive && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 2000,
                background: 'var(--background)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                zIndex: 2001
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff477e', animation: 'pulse 1.5s infinite' }}></div>
                   <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Direct Line: Dr. Sarah Chen</span>
                </div>
                <button 
                  onClick={() => setIsCallActive(false)}
                  style={{ background: '#ff477e', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', boxShadow: '0 0 15px rgba(255, 71, 126, 0.4)' }}
                >
                  <X size={20} />
                </button>
              </div>
              <div style={{ flex: 1, position: 'relative' }}>
                <JitsiCall roomName={roomName} onEnd={() => setIsCallActive(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.2); }
          100% { opacity: 1; transform: scale(1); }
        }
        .dot-flashing {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--primary);
          color: var(--primary);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
          display: inline-block;
          margin-right: 15px;
          margin-left: 5px;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -12px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--primary);
          color: var(--primary);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 12px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--primary);
          color: var(--primary);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% { background-color: var(--primary); }
          50%, 100% { background-color: rgba(0, 209, 255, 0.2); }
        }
      `}</style>

    </Layout>
  );
};

export default TelemedicinePage;

