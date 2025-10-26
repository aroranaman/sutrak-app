
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import type { Garment, Fabric } from '@/lib/data';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { grantJoinBonusIfFirstLogin } from '@/lib/grantJoinBonus';
import { ensureJoinBonus } from '@/lib/fixCredits';

interface UserData {
  credits: number;
  profiles: MeasurementProfile[];
}

interface User {
  id: string;
  name: string;
  phone: string | null;
}

// This should match the structure used in AvatarPreview and MeasurementProfile
export interface MeasurementProfile {
  name: string;
  measurements: {
    bust: number;
    hip: number;
    shoulderWidth: number;
    sleeveLength: number;
    torsoLength: number;
    inseam: number;
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
  loading: boolean;
  addProfile: (profile: MeasurementProfile, newBalance: number) => void;
  addCredits: (amount: number) => void;
  addToCart: (garment: Garment, fabric: Fabric) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: firebaseUser, loading: authLoading } = useAuth();
  const firestore = useFirestore();

  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [profiles, setProfiles] = useState<MeasurementProfile[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Memoize the user document reference
  const userDocRef = React.useMemo(() => {
    if (firestore && firebaseUser) {
      return doc(firestore, 'users', firebaseUser.uid);
    }
    return null;
  }, [firestore, firebaseUser]);
  
  // useDoc will now react to userDocRef changes
  const { data: userData, status: userStatus } = useDoc<UserData>(userDocRef);

  const updateUserDocument = useCallback(
    async (data: Partial<UserData>) => {
      if (!userDocRef) return false;
      try {
        await setDoc(userDocRef, data, { merge: true });
        return true;
      } catch (error) {
        console.error('Error updating user document:', error);
        return false;
      }
    },
    [userDocRef]
  );
  
  useEffect(() => {
    // Grant bonus only when a new firebase user appears
    if (firebaseUser) {
      grantJoinBonusIfFirstLogin(firebaseUser);
      // One-time fix for existing users
      ensureJoinBonus(firebaseUser).then(newBalance => {
         if (newBalance > credits) {
           setCredits(newBalance);
         }
      });
    }
  }, [firebaseUser, credits]);

  useEffect(() => {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (e) {
        console.error('Failed to parse cart from localStorage', e);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (firebaseUser) {
      setUser({
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        phone: firebaseUser.phoneNumber,
      });

      // Now we also depend on userStatus from useDoc
      if (userStatus === 'loading') {
        setLoading(true);
      } else if (userStatus === 'success' && userData) {
        setCredits(userData.credits ?? 0);
        setProfiles(userData.profiles ?? []);
        setLoading(false);
      } else if (userStatus === 'error' || (userStatus === 'success' && !userData)) {
        // User doc might not exist yet, or there was an error.
        // Let's assume 0 credits/profiles until the doc is created.
        setCredits(0);
        setProfiles([]);
        setLoading(false);
      }
    } else {
      // Logged out
      setUser(null);
      setCredits(0);
      setProfiles([]);
      setCart([]);
      setLoading(false);
    }
  }, [firebaseUser, authLoading, userStatus, userData]);


  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
        const localCart = localStorage.getItem('cart');
        if (localCart) {
            localStorage.removeItem('cart');
        }
    }
  }, [cart]);
  
  const clearCart = () => {
    setCart([]);
  };

  const addProfile = (profile: MeasurementProfile, newBalance: number) => {
    // This function now just updates the local state.
    // The server update is handled by the action.
    setProfiles(prev => [...prev, profile]);
    setCredits(newBalance);
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    if (updateUserDocument({ credits: newCredits })) {
      setCredits(newCredits);
    }
  };

  const addToCart = (garment: Garment, fabric: Fabric) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item =>
          item.garment.id === garment.id && item.fabric.id === fabric.id
      );
      if (existingItem) {
        return prevCart.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const newItem: CartItem = {
        id: `${garment.id}-${fabric.id}-${Date.now()}`,
        garment,
        fabric,
        quantity: 1,
      };
      return [...prevCart, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(prevCart =>
        prevCart.map(item => (item.id === itemId ? { ...item, quantity } : item))
      );
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        credits,
        profiles,
        cart,
        loading,
        addProfile,
        addCredits,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
      }}
    >
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
