import { useEffect, useMemo, useState } from "react";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

const LS_KEY = "moviemuse_watchlist";

function readLocal(): number[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
}
function writeLocal(ids: number[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(ids));
}

export function useWatchlist() {
  const { user } = useAuth();
  const [ids, setIds] = useState<number[]>(readLocal());
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Load + merge when user logs in
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;              
      setLoading(true);
      setError(null);
      try {
        const ref = doc(db, "watchlists", user.uid);
        const snap = await getDoc(ref);
        const cloudIds: number[] = snap.exists() ? (snap.data().ids ?? []) : [];
        const merged = Array.from(new Set<number>([...cloudIds, ...readLocal()]));
        if (!cancelled) {
          setIds(merged);
          writeLocal(merged);          
        }
        if (!snap.exists()) {
          await setDoc(ref, { ids: merged, updatedAt: serverTimestamp() });
        } else if (merged.length !== cloudIds.length) {
          await updateDoc(ref, { ids: merged, updatedAt: serverTimestamp() });
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load watchlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  // Helpers
  const has = (id: number) => ids.includes(id);

  async function persist(next: number[]) {
    writeLocal(next);
    if (!user) return; 
    setSaving(true);
    setError(null);
    try {
      const ref = doc(db, "watchlists", user.uid);
      await updateDoc(ref, { ids: next, updatedAt: serverTimestamp() }).catch(async (err) => {
        // If doc doesn't exist yet, create it
        if (String(err?.code || "").includes("not-found")) {
          await setDoc(ref, { ids: next, updatedAt: serverTimestamp() });
        } else {
          throw err;
        }
      });
    } catch (e: any) {
      setError(e?.message || "Failed to save watchlist");
    } finally {
      setSaving(false);
    }
  }

  const add = (id: number) => {
    setIds((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      persist(next);
      return next;
    });
  };

  const remove = (id: number) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      persist(next);
      return next;
    });
  };

  return useMemo(() => ({ ids, has, add, remove, loading, saving, error }), [ids, loading, saving, error]);
}
