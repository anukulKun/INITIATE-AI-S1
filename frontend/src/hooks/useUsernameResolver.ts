"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export function useUsernameResolver(username: string) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!username.endsWith(".init")) {
      setAddress(null);
      setError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await api.resolve(username);
        if (!cancelled) {
          setAddress(result.address);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
          setAddress(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username]);

  return { address, loading, error };
}
