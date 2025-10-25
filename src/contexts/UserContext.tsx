
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Garment, Fabric } from '@/lib/data';

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

export interface CartItem {
    id: string;
    garment: Garment;
    fabric: Fabric;
    quantity: number;
}


interface UserContextType {
  user: User | null;
  credits: number;
  profiles: MeasurementProfile[];
  cart: CartItem[];
  login: () => void;
  logout: () => void;
  addProfile: (profile: MeasurementProfile) => boolean;
  addCredits: (amount: number) => void;
  addToCart: (garment: Garment, fabric: Fabric) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const login = () => {
    setUser({ id: 'user-123', name: 'Alex Doe', phone: '+1234567890' });
    setCredits(500); // Initial credits on sign-up
  };

  const logout = () => {
    setUser(null);
    setCredits(0);
    setProfiles([]);
    setCart([]);
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

  const addToCart = (garment: Garment, fabric: Fabric) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.garment.id === garment.id && item.fabric.id === fabric.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === existingItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      const newItem: CartItem = { id: `${garment.id}-${fabric.id}-${Date.now()}`, garment, fabric, quantity: 1 };
      return [...prevCart, newItem];
    });
  }

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart => prevCart.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ));
    }
  }


  return (
    <UserContext.Provider value={{ user, credits, profiles, cart, login, logout, addProfile, addCredits, addToCart, removeFromCart, updateQuantity }}>
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
