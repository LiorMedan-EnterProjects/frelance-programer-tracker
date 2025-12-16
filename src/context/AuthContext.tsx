"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    User,
    GoogleAuthProvider,
    GithubAuthProvider
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase";
import { createUserProfile } from "@/lib/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithGithub: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
            await createUserProfile({
                uid: result.user.uid,
                email: result.user.email || '',
                displayName: result.user.displayName || '',
                photoURL: result.user.photoURL || '',
                settings: { theme: 'system' }
            });
        }
    };

    const signInWithGithub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        if (result.user) {
            await createUserProfile({
                uid: result.user.uid,
                email: result.user.email || '',
                displayName: result.user.displayName || '',
                photoURL: result.user.photoURL || '',
                settings: { theme: 'system' }
            });
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithGithub, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
