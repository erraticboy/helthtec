import React, { createContext, useContext, useState, useEffect } from 'react';

export type Role = 'user' | 'worker';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  password?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string, role?: Role, name?: string) => string | null; // Returns error string if fails
  logout: () => void;
  updatePassword: (email: string, newPassword: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load from local storage on mount
    const storedUser = localStorage.getItem('hg_auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse auth user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password?: string, role?: Role, name?: string): string | null => {
    const rawUsers = localStorage.getItem('hg_db_users');
    const dbUsers: User[] = rawUsers ? JSON.parse(rawUsers) : [];

    // Is this a signup attempt? (name is provided)
    if (name && role && password) {
      if (dbUsers.find(u => u.email === email)) {
        return "An account with this email already exists.";
      }
      const newUser: User = { 
        id: Math.random().toString(36).substr(2, 9), 
        email, 
        role, 
        name,
        password
      };
      
      // Save directly to db_users to prevent circular context dependencies
      localStorage.setItem('hg_db_users', JSON.stringify([...dbUsers, newUser]));
      
      setUser(newUser);
      localStorage.setItem('hg_auth_user', JSON.stringify(newUser));
      return null;
    } 
    
    // Otherwise it's a login attempt
    const existingUser = dbUsers.find(u => u.email === email);
    
    if (!existingUser) {
      return "User not found. Please click 'Sign up' to register first.";
    }

    if (existingUser.password !== password) {
      return "Incorrect Password.";
    }

    // Success
    setUser(existingUser);
    localStorage.setItem('hg_auth_user', JSON.stringify(existingUser));
    return null;
  };

  const updatePassword = (email: string, newPassword: string) => {
    const rawUsers = localStorage.getItem('hg_db_users');
    const dbUsers: User[] = rawUsers ? JSON.parse(rawUsers) : [];
    
    const index = dbUsers.findIndex(u => u.email === email);
    if (index !== -1) {
      dbUsers[index].password = newPassword;
      localStorage.setItem('hg_db_users', JSON.stringify(dbUsers));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hg_auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updatePassword, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
