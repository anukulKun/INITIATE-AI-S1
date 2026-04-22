"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, persistSession } from "@/lib/api";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result =
        mode === "login"
          ? await api.login(email, password)
          : await api.register(email, password, walletAddress || undefined);
      persistSession(result.token, result.user);
      router.push("/workflow");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6">
      <form onSubmit={handleSubmit} className="card w-full p-6">
        <h1 className="text-2xl font-bold">{mode === "login" ? "Sign In" : "Create Account"}</h1>
        <p className="mt-1 text-sm text-gray-400">JWT auth for the INITIATE AI S1 platform.</p>

        <div className="mt-5 space-y-3">
          <input
            className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            required
          />
          <input
            className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            type="password"
            required
            minLength={8}
          />
          {mode === "register" && (
            <input
              className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="Wallet Address (optional)"
            />
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <button
          className="mt-5 w-full rounded-md bg-brand-neon px-4 py-2 font-semibold text-black disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <button
          className="mt-3 w-full rounded-md border border-white/20 px-4 py-2 text-sm"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          type="button"
        >
          {mode === "login" ? "Need an account? Register" : "Already have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}

