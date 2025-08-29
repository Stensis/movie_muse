import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut as fbSignOut,
    updateProfile,
    User,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

type AppUser = Pick<User, "uid" | "email" | "displayName" | "photoURL"> | null;

type AuthCtx = {
    user: AppUser;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AppUser>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(
                u
                    ? {
                        uid: u.uid,
                        email: u.email,
                        displayName: u.displayName,
                        photoURL: u.photoURL,
                    }
                    : null
            );
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const value = useMemo<AuthCtx>(
        () => ({
            user,
            loading,
            async signIn(email, password) {
                await signInWithEmailAndPassword(auth, email, password);
            },
            async signUp(email, password, displayName) {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                if (displayName) {
                    await updateProfile(cred.user, { displayName });
                }
            },
            async signInWithGoogle() {
                await signInWithPopup(auth, googleProvider);
            },
            async signOut() {
                await fbSignOut(auth);
            },
        }),
        [user, loading]
    );

    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
    return ctx;
}
