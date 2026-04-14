import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/context/AuthContext';

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  receiverId?: string; // If targeting a specific user, or "global" for demo purposes
}

export interface ProblemReport {
  id: string;
  userId: string;
  userName: string;
  description: string;
  location: { lat: number; lng: number } | null;
  status: 'pending' | 'resolved';
  timestamp: number;
}

interface DatabaseContextType {
  messages: ChatMessage[];
  sendMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  problems: ProblemReport[];
  submitProblem: (prob: Omit<ProblemReport, 'id' | 'timestamp' | 'status'>) => void;
  resolveProblem: (id: string) => void;
  users: User[]; // Track all users for worker to see
  registerUser: (user: User) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [problems, setProblems] = useState<ProblemReport[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Listen to cross-tab storage events
  useEffect(() => {
    const loadData = () => {
      const storedMsgs = localStorage.getItem('hg_db_messages');
      const storedProbs = localStorage.getItem('hg_db_problems');
      const storedUsers = localStorage.getItem('hg_db_users');
      
      if (storedMsgs) setMessages(JSON.parse(storedMsgs));
      if (storedProbs) setProblems(JSON.parse(storedProbs));
      if (storedUsers) setUsers(JSON.parse(storedUsers));
    };

    loadData();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('hg_db_')) {
        loadData();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Periodically poll for changes in case we are in same tab but want to be absolutely sure (not completely necessary if cross-tab)
    const interval = setInterval(loadData, 2000); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const sendMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMsg: ChatMessage = {
      ...msg,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now()
    };
    
    // Read fresh state before writing to simulate DB transaction
    const storedMsgs = localStorage.getItem('hg_db_messages');
    const currentMsgs = storedMsgs ? JSON.parse(storedMsgs) : messages;
    
    const updatedMsgs = [...currentMsgs, newMsg];
    setMessages(updatedMsgs);
    localStorage.setItem('hg_db_messages', JSON.stringify(updatedMsgs));
  };

  const submitProblem = (prob: Omit<ProblemReport, 'id' | 'timestamp' | 'status'>) => {
    const newProb: ProblemReport = {
      ...prob,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      timestamp: Date.now()
    };
    
    const storedProbs = localStorage.getItem('hg_db_problems');
    const currentProbs = storedProbs ? JSON.parse(storedProbs) : problems;

    const updatedProbs = [...currentProbs, newProb];
    setProblems(updatedProbs);
    localStorage.setItem('hg_db_problems', JSON.stringify(updatedProbs));
  };

  const resolveProblem = (id: string) => {
    const storedProbs = localStorage.getItem('hg_db_problems');
    const currentProbs: ProblemReport[] = storedProbs ? JSON.parse(storedProbs) : problems;

    const updatedProbs = currentProbs.map(p => p.id === id ? { ...p, status: 'resolved' as const } : p);
    setProblems(updatedProbs);
    localStorage.setItem('hg_db_problems', JSON.stringify(updatedProbs));
  };

  const registerUser = (user: User) => {
    const storedUsers = localStorage.getItem('hg_db_users');
    const currentUsers: User[] = storedUsers ? JSON.parse(storedUsers) : users;
    
    if (!currentUsers.find(u => u.id === user.id)) {
      const updatedUsers = [...currentUsers, user];
      setUsers(updatedUsers);
      localStorage.setItem('hg_db_users', JSON.stringify(updatedUsers));
    }
  };

  return (
    <DatabaseContext.Provider value={{ messages, sendMessage, problems, submitProblem, resolveProblem, users, registerUser }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDb = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDb must be used within a DatabaseProvider');
  }
  return context;
};
