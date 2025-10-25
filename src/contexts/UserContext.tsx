"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
}

interface MeasurementProfile {
  name: string;
  measurements: {
    bust: number;
    waist: number;
    hip: number;
    inseam: number;
    shoulderWidth: number;
  };
}

interface UserContextType {
  user: User | null;
  credits: number;
  profiles: MeasurementProfile[];
  login: () => void;
  logout: () => void;
  addProfile: (profile: MeasurementProfile) => boolean;
  addCredits: (amount: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);

  const login = () => {
    setUser({ id: 'user-123', name: 'Alex Doe', phone: '+1234567890' });
    setCredits(500); // Initial credits on sign-up
  };

  const logout = () => {
    setUser(null);
    setCredits(0);
    setProfiles([]);
  };

  const addProfile = (profile: MeasurementProfile) => {
    if (credits >= 100) {
      setCredits((prev) => prev - 100);
      setProfiles((prev) => [...prev, profile]);
      return true;
    }
    return false;
  };
  
  const addCredits = (amount: number) => {
    setCredits((prev) => prev + amount);
  }

  return (
    <UserContext.Provider value={{ user, credits, profiles, login, logout, addProfile, addCredits }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
