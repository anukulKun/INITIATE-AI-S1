"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, persistSession } from "@/lib/api";
import { Network, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:          #0a0a0a;
          --bg-2:        #111111;
          --bg-3:        #1a1a1a;
          --border:      rgba(255,255,255,0.08);
          --border-2:    rgba(255,255,255,0.13);
          --text:        rgb(237,237,237);
          --text-muted:  rgb(160,160,160);
          --text-dim:    rgb(100,100,100);
          --accent:         #adff2f;
          --accent-fg:      #000000;
          --accent-dim:     rgba(173,255,47,0.10);
          --accent-border:  rgba(173,255,47,0.2);
          --error:          #ef4444;
          --error-dim:      rgba(239,68,68,0.08);
          --error-border:   rgba(239,68,68,0.3);
          --font-sans:  'Geist', ui-sans-serif, system-ui, sans-serif;
          --font-tight: 'Inter Tight', ui-sans-serif, sans-serif;
          --font-mono:  'JetBrains Mono', monospace;
        }

        [data-theme="light"] {
          --bg:          #fafaf8;
          --bg-2:        #f2f1ee;
          --bg-3:        #e8e7e3;
          --border:      rgba(0,0,0,0.08);
          --border-2:    rgba(0,0,0,0.15);
          --text:        rgb(18,18,18);
          --text-muted:  rgb(70,70,70);
          --text-dim:    rgb(140,140,140);
          --accent:         #1a6b00;
          --accent-fg:      #ffffff;
          --accent-dim:     rgba(26,107,0,0.09);
          --accent-border:  rgba(26,107,0,0.22);
        }

        html, body {
          font-family: var(--font-sans);
          background: var(--bg); color: var(--text);
          min-height: 100vh;
          -webkit-font-smoothing: antialiased;
          transition: background 0.25s, color 0.25s;
        }

        /* ── Nav ── */
        .auth-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 52px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; background: var(--bg);
          border-bottom: 1px solid var(--border);
        }
        .nav-left { display: flex; align-items: center; gap: 10px; }
        .nav-logo {
          width: 28px; height: 28px; background: var(--accent);
          border-radius: 6px; display: grid; place-items: center;
          color: var(--accent-fg); text-decoration: none; flex-shrink: 0;
        }
        .nav-wordmark {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); letter-spacing: 0.02em; text-decoration: none;
        }
        .nav-divider { width: 1px; height: 18px; background: var(--border-2); margin: 0 4px; }
        .nav-sub {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim); letter-spacing: 0.04em;
        }
        .theme-btn {
          display: inline-flex; align-items: center; gap: 7px; padding: 5px 12px;
          background: var(--bg-2); border: 1px solid var(--border-2); border-radius: 5px;
          cursor: pointer; font-family: var(--font-mono); font-size: 10px;
          color: var(--text-dim); transition: color 0.15s; user-select: none; outline: none;
        }
        .theme-btn:hover { color: var(--text-muted); }
        .theme-btn .ti {
          width: 12px; height: 12px; border-radius: 50%;
          border: 1.5px solid var(--text-dim); flex-shrink: 0; transition: background 0.2s;
        }
        .theme-btn .ti.filled { background: var(--text-dim); }

        /* ── Page shell ── */
        .auth-shell {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 80px 24px 40px;
        }

        /* ── Card ── */
        .auth-card {
          width: 100%; max-width: 400px;
          background: var(--bg-2); border: 1px solid var(--border);
          border-radius: 10px; overflow: hidden;
          animation: fadeUp 0.35s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Card header */
        .card-head {
          padding: 28px 28px 24px;
          border-bottom: 1px solid var(--border);
        }
        .card-eyebrow {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 10px;
          display: flex; align-items: center; gap: 8px;
        }
        .card-eyebrow::before {
          content: ''; display: block; width: 16px; height: 1px; background: var(--text-dim);
        }
        .card-title {
          font-family: var(--font-tight); font-size: 22px; font-weight: 700;
          color: var(--text); letter-spacing: -0.03em; margin-bottom: 5px;
        }
        .card-sub {
          font-family: var(--font-sans); font-size: 13px;
          color: var(--text-dim); line-height: 1.5;
        }

        /* Mode tabs */
        .mode-tabs {
          display: flex; border-bottom: 1px solid var(--border);
        }
        .mode-tab {
          flex: 1; padding: 12px; text-align: center;
          font-family: var(--font-tight); font-size: 12px; font-weight: 600;
          color: var(--text-dim); background: transparent;
          border: none; cursor: pointer; transition: all 0.15s;
          border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
        .mode-tab:hover { color: var(--text-muted); }
        .mode-tab.active {
          color: var(--text);
          border-bottom-color: var(--accent);
        }

        /* Form body */
        .card-body { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 12px; }

        /* Field */
        .field { display: flex; flex-direction: column; gap: 5px; }
        .field-label {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .field-wrap { position: relative; }
        .field-input {
          width: 100%; padding: 9px 12px;
          background: var(--bg); color: var(--text);
          border: 1px solid var(--border); border-radius: 6px;
          font-family: var(--font-sans); font-size: 13px; font-weight: 400;
          outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          appearance: none;
        }
        .field-input::placeholder { color: var(--text-dim); }
        .field-input:focus {
          border-color: var(--border-2);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .field-input.has-toggle { padding-right: 40px; }

        .pass-toggle {
          position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: var(--text-dim);
          display: grid; place-items: center; padding: 2px;
          transition: color 0.15s;
        }
        .pass-toggle:hover { color: var(--text-muted); }

        .field-hint {
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          letter-spacing: 0.03em;
        }

        /* Error */
        .auth-error {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 10px 12px; background: var(--error-dim);
          border: 1px solid var(--error-border); border-radius: 6px;
        }
        .error-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--error); flex-shrink: 0; margin-top: 4px; }
        .auth-error span {
          font-family: var(--font-sans); font-size: 12px; color: var(--error); line-height: 1.5;
        }

        /* Divider */
        .field-divider {
          height: 1px; background: var(--border); margin: 4px 0;
        }

        /* Submit */
        .btn-submit {
          width: 100%; padding: 10px 20px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border: none; border-radius: 6px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          letter-spacing: 0.01em;
        }
        .btn-submit:hover:not(:disabled) { opacity: 0.87; transform: translateY(-1px); }
        .btn-submit:disabled { opacity: 0.45; cursor: not-allowed; }

        /* Spinner */
        .spinner {
          width: 13px; height: 13px; border-radius: 50%;
          border: 2px solid var(--accent-fg); border-top-color: transparent;
          animation: spin 0.7s linear infinite; flex-shrink: 0;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Footer note */
        .card-foot {
          padding: 14px 28px; border-top: 1px solid var(--border);
          font-family: var(--font-mono); font-size: 10px; color: var(--text-dim);
          letter-spacing: 0.04em; text-align: center; line-height: 1.6;
        }
        .card-foot a { color: var(--accent); text-decoration: none; }
        .card-foot a:hover { text-decoration: underline; }

        /* Optional badge */
        .optional-badge {
          display: inline-flex; align-items: center; padding: 1px 7px;
          background: var(--bg-3); border: 1px solid var(--border);
          border-radius: 4px; font-family: var(--font-mono); font-size: 9px;
          color: var(--text-dim); letter-spacing: 0.05em; text-transform: uppercase;
          margin-left: 6px;
        }
      `}</style>

      {/* ── Nav ── */}
      <nav className="auth-nav">
        <div className="nav-left">
          <Link href="/" className="nav-logo"><Network size={15} /></Link>
          <Link href="/" className="nav-wordmark">INITIATE AI S1</Link>
          <div className="nav-divider" />
          <span className="nav-sub">Initia Native DeFi Automation</span>
        </div>
        <button className="theme-btn" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")} aria-label="Toggle theme">
          <div className={`ti${theme === "light" ? " filled" : ""}`} />
          {theme === "dark" ? "light" : "dark"}
        </button>
      </nav>

      {/* ── Shell ── */}
      <div className="auth-shell">
        <div className="auth-card">

          {/* Header */}
          <div className="card-head">
            <div className="card-eyebrow">INITIATE AI S1</div>
            <div className="card-title">
              {mode === "login" ? "Welcome back." : "Create account."}
            </div>
            <div className="card-sub">
              {mode === "login"
                ? "Sign in to access your agent workflows and dashboard."
                : "Join the platform and start building DeFi agents today."}
            </div>
          </div>

          {/* Mode tabs */}
          <div className="mode-tabs">
            <button className={`mode-tab${mode === "login" ? " active" : ""}`} onClick={() => { setMode("login"); setError(""); }}>
              Sign In
            </button>
            <button className={`mode-tab${mode === "register" ? " active" : ""}`} onClick={() => { setMode("register"); setError(""); }}>
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="card-body">

              {/* Email */}
              <div className="field">
                <label className="field-label">Email</label>
                <div className="field-wrap">
                  <input
                    className="field-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="field">
                <label className="field-label">Password</label>
                <div className="field-wrap">
                  <input
                    className="field-input has-toggle"
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "register" ? "Min. 8 characters" : "••••••••"}
                    required
                    minLength={8}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(v => !v)} tabIndex={-1}>
                    {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
                {mode === "register" && (
                  <span className="field-hint">Must be at least 8 characters.</span>
                )}
              </div>

              {/* Wallet (register only) */}
              {mode === "register" && (
                <>
                  <div className="field-divider" />
                  <div className="field">
                    <label className="field-label">
                      Wallet Address
                      <span className="optional-badge">optional</span>
                    </label>
                    <div className="field-wrap">
                      <input
                        className="field-input"
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder="init1…"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Error */}
              {error && (
                <div className="auth-error">
                  <div className="error-dot" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button className="btn-submit" type="submit" disabled={loading}>
                {loading ? (
                  <><div className="spinner" /> Please wait…</>
                ) : mode === "login" ? (
                  <>Sign In <ArrowRight size={13} /></>
                ) : (
                  <>Create Account <ArrowRight size={13} /></>
                )}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div className="card-foot">
            JWT-secured · Initia wallet support ·{" "}
            <Link href="/workflow">Go to builder →</Link>
          </div>
        </div>
      </div>
    </>
  );
}