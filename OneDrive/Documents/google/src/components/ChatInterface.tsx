import React, { useState, useEffect, useRef } from 'react';
import { useDb } from '@/context/DatabaseContext';
import { useAuth } from '@/context/AuthContext';
import { X, Send, Video, User as UserIcon } from 'lucide-react';

export default function ChatInterface({ onClose, targetWorkerId, targetUserId }: { onClose: () => void, targetWorkerId?: string, targetUserId?: string }) {
  const { messages, sendMessage, users } = useDb();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(targetUserId || null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isWorker = user?.role === 'worker';

  useEffect(() => {
    if (targetUserId) {
      setSelectedUser(targetUserId);
    }
  }, [targetUserId]);

  // Filter messages based on role and selection
  const visibleMessages = messages.filter(m => {
    if (!isWorker) {
      if (targetWorkerId) {
        // If we targeted a specific doctor, only show messages between me and them
        return (m.senderId === user?.id && m.receiverId === targetWorkerId) || 
               (m.senderId === targetWorkerId && m.receiverId === user?.id);
      }
      // Global fallback
      return m.senderId === user?.id || m.receiverId === user?.id || !m.receiverId;
    } else {
      // Worker selected a user
      if (!selectedUser) return false;
      return (m.senderId === selectedUser && m.receiverId === user?.id) || 
             (m.senderId === user?.id && m.receiverId === selectedUser) ||
             (m.senderId === selectedUser && !m.receiverId); // support older global msgs from user
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    
    // Set receiver ID based on context
    let rxId = undefined;
    if (isWorker) rxId = selectedUser || undefined;
    if (!isWorker) rxId = targetWorkerId || undefined;

    sendMessage({
      senderId: user.id,
      senderName: user.name,
      text: text,
      receiverId: rxId
    });
    setText('');
  };

  const handleGenerateMeet = () => {
    const meetId = Math.random().toString(36).substring(2, 12);
    // Using Jitsi Meet provides an instantly workable room with no API required!
    const link = `https://meet.jit.si/HealthGap-${meetId}`;
    setText(`Please join my instant video consultation here: ${link}`);
  };

  return (
    <div style={{
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000,
      width: '350px', height: '500px', 
      background: 'rgba(10, 15, 25, 0.95)', backdropFilter: 'blur(15px)',
      border: '1px solid var(--surface-border)', borderRadius: '16px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden'
    }} className="animate-fade-in">
      
      {/* Header */}
      <div style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', background: '#00ff00', borderRadius: '50%', boxShadow: '0 0 8px #00ff00' }} />
          Support Chat
        </h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
      </div>

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* User selector for workers */}
        {isWorker && (
          <div style={{ padding: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <select 
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', outline: 'none' }}
            >
              <option value="" disabled>Select User to Chat...</option>
              {users.filter(u => u.role === 'user').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {isWorker && !selectedUser ? (
             <div style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
               Select a user to start chatting.
             </div>
          ) : visibleMessages.length === 0 ? (
             <div style={{ margin: 'auto', color: 'var(--text-muted)', textAlign: 'center', fontSize: '0.9rem' }}>
               No messages yet. Say hello!
             </div>
          ) : (
             visibleMessages.map(msg => {
               const isMe = msg.senderId === user?.id;
               
               // Render links safely
               const renderText = (t: string) => {
                 const parts = t.split(/(https?:\/\/[^\s]+)/g);
                 return parts.map((part, i) => 
                   part.match(/https?:\/\/[^\s]+/) ? <a key={i} href={part} target="_blank" rel="noreferrer" style={{ color: '#00A6FF', textDecoration: 'underline', wordBreak: 'break-all' }}>{part}</a> : <span key={i}>{part}</span>
                 );
               };

               return (
                 <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px', marginLeft: '4px' }}>
                      {msg.senderName}
                    </span>
                    <div style={{
                      padding: '10px 14px', borderRadius: '16px', fontSize: '0.9rem',
                      background: isMe ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                      color: 'white', maxWidth: '85%', wordBreak: 'break-word',
                      borderBottomRightRadius: isMe ? '4px' : '16px',
                      borderBottomLeftRadius: isMe ? '16px' : '4px'
                    }}>
                      {renderText(msg.text)}
                    </div>
                 </div>
               )
             })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {(!isWorker || selectedUser) && (
        <form onSubmit={handleSend} style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '8px' }}>
          {isWorker && (
            <button 
              type="button" 
              onClick={handleGenerateMeet}
              className="hover:text-primary transition-colors"
              title="Generate Google Meet Link"
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0 4px' }}
            >
              <Video size={20} />
            </button>
          )}
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1, padding: '10px', borderRadius: '20px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}
          />
          <button type="submit" disabled={!text.trim()} style={{
            background: text.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '50%', width: '38px', height: '38px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', cursor: text.trim() ? 'pointer' : 'default', transition: 'all 0.2s'
          }}>
            <Send size={16} style={{ marginLeft: '2px' }}/>
          </button>
        </form>
      )}
    </div>
  );
}
