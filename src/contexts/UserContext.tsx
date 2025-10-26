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
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface UserData {
  credits: number;
  profiles: MeasurementProfile[];
}

interface User {
  id: string;
  name: string;
  phone: string | null;
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
  loading: boolean;
  addProfile: (profile: MeasurementProfile) => boolean;
  addCredits: (amount: number) => void;
  addToCart: (garment: Garment, fabric: Fabric) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
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

  const userDocRef =
    firestore && firebaseUser
      ? doc(firestore, 'users', firebaseUser.uid)
      : null;
  const { data: userData, status: userStatus } = useDoc<UserData>(userDocRef);
  
  const createNewUserDoc = useCallback(async (newUser: FirebaseUser) => {
    if (!firestore) return;
    const newUserDocRef = doc(firestore, 'users', newUser.uid);
    const docSnap = await getDoc(newUserDocRef);

    if (!docSnap.exists()) {
      const initialData = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.displayName,
        phoneNumber: newUser.phoneNumber,
        createdAt: serverTimestamp(),
        credits: 10000,
        profiles: [],
      };
      await setDoc(newUserDocRef, initialData);
      setCredits(10000);
      setProfiles([]);
    } else {
        const data = docSnap.data() as UserData;
        setCredits(data.credits || 0);
        setProfiles(data.profiles || []);
    }
    setLoading(false);
  }, [firestore]);


  useEffect(() => {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      try {
        setCart(JSON.parse(localCart));
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
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

        if (userStatus === 'loading') {
            setLoading(true);
        } else if (userStatus === 'success' && userData) {
            setCredits(userData.credits ?? 0);
            setProfiles(userData.profiles ?? []);
            setLoading(false);
        } else if (userStatus === 'error' || (userStatus === 'success' && !userData)) {
            // This case handles a new user where the doc doesn't exist yet.
            createNewUserDoc(firebaseUser);
        }
    } else {
        // No user is signed in
        setUser(null);
        setCredits(0);
        setProfiles([]);
        setLoading(false);
    }
  }, [firebaseUser, authLoading, firestore, userData, userStatus, createNewUserDoc]);

  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem('cart', JSON.stringify(cart));
    } else {
      localStorage.removeItem('cart');
    }
  }, [cart]);

  const updateUserDocument = async (data: Partial<UserData>) => {
    if (!userDocRef) return false;
    try {
      await setDoc(userDocRef, data, { merge: true });
      return true;
    } catch (error) {
      console.error('Error updating user document:', error);
      return false;
    }
  };

  const addProfile = (profile: MeasurementProfile) => {
    if (credits >= 100) {
      const newCredits = credits - 100;
      const newProfiles = [...profiles, profile];
      if (updateUserDocument({ credits: newCredits, profiles: newProfiles })) {
        setCredits(newCredits);
        setProfiles(newProfiles);
        return true;
      }
    }
    return false;
  };

  const addCredits = (amount: number) => {
    const newCredits = credits + amount;
    if (updateUserDocument({ credits: newCredits })) {
      setCredits(newCredits);
    }
  };

  const addToCart = (garment: Garment, fabric: Fabric) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) =>
          item.garment.id === garment.id && item.fabric.id === fabric.id
      );
      if (existingItem) {
        return prevCart.map((item) =>
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
    setCart((prevCart) => prevCart.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) => (item.id === itemId ? { ...item, quantity } : item))
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
