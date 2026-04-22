"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Network, ArrowRight, Shield, Bot, Workflow, GitBranch, Globe, Zap } from "lucide-react";

export default function HomePage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&family=Inter+Tight:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:         #0a0a0a;
          --bg-2:       #111111;
          --bg-3:       #1a1a1a;
          --border:     rgba(255,255,255,0.08);
          --border-2:   rgba(255,255,255,0.13);
          --text:       rgb(237,237,237);
          --text-muted: rgb(160,160,160);
          --text-dim:   rgb(100,100,100);
          --accent:         #adff2f;
          --accent-fg:      #000000;
          --accent-dim:     rgba(173,255,47,0.12);
          --accent-border:  rgba(173,255,47,0.2);
          --font-sans:  'Geist', "Apple Color Emoji", ui-sans-serif, system-ui, sans-serif;
          --font-tight: 'Inter Tight', "Apple Color Emoji", ui-sans-serif, sans-serif;
          --font-mono:  'JetBrains Mono', monospace;
        }

        [data-theme="light"] {
          --bg:         #fafaf8;
          --bg-2:       #f2f1ee;
          --bg-3:       #e8e7e3;
          --border:     rgba(0,0,0,0.08);
          --border-2:   rgba(0,0,0,0.15);
          --text:       rgb(18,18,18);
          --text-muted: rgb(70,70,70);
          --text-dim:   rgb(140,140,140);
          /* crisp dark-green — clearly visible on warm-white bg */
          --accent:        #1a6b00;
          --accent-fg:     #ffffff;
          --accent-dim:    rgba(26,107,0,0.09);
          --accent-border: rgba(26,107,0,0.22);
        }

        html, body {
          font-family: var(--font-sans);
          background: var(--bg); color: var(--text);
          font-size: 16px; line-height: normal; font-weight: 400;
          -webkit-font-smoothing: antialiased;
          transition: background 0.25s, color 0.25s;
          overflow-x: hidden;
        }

        /* ── Shared buttons ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border: none; border-radius: 5px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
          text-decoration: none; line-height: 20px; letter-spacing: 0.01em;
        }
        .btn-primary:hover { opacity: 0.85; transform: translateY(-1px); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: transparent;
          border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
          transition: all 0.15s; text-decoration: none; line-height: 20px;
        }
        .btn-ghost:hover { color: var(--text); background: var(--bg-2); }

        /* ── FCE-style theme toggle ── */
        .theme-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 5px 12px;
          background: var(--bg-2); border: 1px solid var(--border-2);
          border-radius: 5px; cursor: pointer;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          transition: color 0.15s; user-select: none; outline: none;
        }
        .theme-btn:hover { color: var(--text-muted); }
        .theme-btn .ti {
          width: 12px; height: 12px; border-radius: 50%;
          border: 1.5px solid rgb(119,119,119); transition: background 0.2s; flex-shrink: 0;
        }
        .theme-btn .ti.filled { background: rgb(119,119,119); }

        /* ── Nav ── */
        .nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          height: 52px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; background: var(--bg);
          border-bottom: 1px solid var(--border); transition: background 0.25s;
        }
        .nav-left { display: flex; align-items: center; gap: 10px; }
        .nav-logo {
          width: 30px; height: 30px; background: var(--accent);
          border-radius: 6px; display: grid; place-items: center; flex-shrink: 0;
          color: var(--accent-fg);
        }
        .nav-wordmark {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); line-height: 20px; letter-spacing: 0.02em;
        }
        .nav-divider { width: 1px; height: 18px; background: var(--border-2); margin: 0 4px; }
        .nav-sub {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
        }
        .nav-right { display: flex; align-items: center; gap: 8px; }

        /* ── Ticker ── */
        .ticker-wrap {
          margin-top: 52px; overflow: hidden;
          border-bottom: 1px solid var(--border); padding: 11px 0; background: var(--bg-2);
        }
        .ticker { display: flex; width: max-content; animation: tick 34s linear infinite; }
        .tick-item {
          display: flex; align-items: center; gap: 8px; padding: 0 28px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          letter-spacing: 0.07em; text-transform: uppercase; white-space: nowrap;
        }
        .tick-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }
        @keyframes tick { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }

        /* ── Hero ── */
        .hero { padding: 60px 28px 72px; max-width: 1120px; }
        .hero-eyebrow {
          display: inline-flex; align-items: center; gap: 10px; margin-bottom: 28px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          letter-spacing: 0.09em; text-transform: uppercase;
        }
        .hero-eyebrow::before { content:''; display:block; width:22px; height:1px; background:rgb(119,119,119); }
        .hero h1 {
          font-family: var(--font-sans); font-size: clamp(42px,5.8vw,82px);
          font-weight: 800; line-height: 1.0; letter-spacing: -0.04em; color: var(--text);
        }
        .hero h1 .headline-line { white-space: nowrap; display: inline-block; }
        .hero h1 .muted { color: var(--text-dim); }
        .hero-desc {
          font-family: var(--font-sans); font-size: 15px; font-weight: 400;
          color: var(--text-muted); line-height: 1.65;
          max-width: 500px; margin-top: 26px; margin-bottom: 36px;
        }
        .hero-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

        .btn-hero-primary {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border: none; border-radius: 5px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s; text-decoration: none;
          letter-spacing: 0.01em; line-height: 20px;
        }
        .btn-hero-primary:hover { opacity: 0.86; transform: translateY(-1px); }

        .btn-hero-ghost {
          display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: transparent;
          border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
          transition: all 0.15s; text-decoration: none; line-height: 20px;
        }
        .btn-hero-ghost:hover { color: var(--text); background: var(--bg-2); }

        .initia-badges { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 32px; }
        .ibadge {
          display: flex; align-items: center; gap: 7px; padding: 5px 11px;
          background: var(--bg-2); border: 1px solid var(--border); border-radius: 5px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px; transition: all 0.15s;
        }
        .ibadge:hover { border-color: var(--border-2); color: var(--text-muted); }
        .ibadge .ck { color: var(--accent); }

        /* ── Stats ── */
        .stats { display: flex; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .stat { flex:1; padding: 22px 28px; border-right: 1px solid var(--border); }
        .stat:last-child { border-right: none; }
        .stat-val {
          font-family: var(--font-sans); font-size: 26px; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text); line-height: 1;
        }
        .stat-val span { color: var(--accent); }
        .stat-lbl {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px; margin-top: 5px;
        }

        /* ── Section ── */
        .section { padding: 64px 28px; }
        .section-lbl {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          letter-spacing: 0.09em; text-transform: uppercase; margin-bottom: 36px;
          display: flex; align-items: center; gap: 12px;
        }
        .section-lbl::after { content:''; flex:1; height:1px; background:var(--border); max-width:180px; }

        /* ── Feature grid ── */
        .feat-grid {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: 1px solid var(--border); border-radius: 7px; overflow: hidden;
        }
        .feat-card {
          padding: 28px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border);
          transition: background 0.2s;
        }
        .feat-card:nth-child(3n) { border-right: none; }
        .feat-card:nth-last-child(-n+3) { border-bottom: none; }
        .feat-card:hover { background: var(--bg-2); }
        .feat-icon {
          width: 32px; height: 32px; background: var(--bg-3); border: 1px solid var(--border);
          border-radius: 7px; display: grid; place-items: center; margin-bottom: 18px;
          transition: background 0.2s; color: var(--accent);
        }
        .feat-card:hover .feat-icon { background: var(--accent-dim); }
        .feat-title {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); margin-bottom: 7px; letter-spacing: -0.01em; line-height: 20px;
        }
        .feat-desc {
          font-family: var(--font-sans); font-size: 13px; font-weight: 400;
          color: var(--text-muted); line-height: 1.6;
        }

        /* ── Modules ── */
        .mods-row {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: 1px solid var(--border); border-radius: 7px; overflow: hidden;
        }
        .mod-card { padding: 28px; border-right: 1px solid var(--border); }
        .mod-card:last-child { border-right: none; }
        .mod-tag {
          display: inline-flex; align-items: center; padding: 2px 8px;
          background: var(--bg-3); border: 1px solid var(--border); border-radius: 4px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 18px;
        }
        .mod-title {
          font-family: var(--font-tight); font-size: 18px; font-weight: 600;
          color: var(--text); letter-spacing: -0.02em; margin-bottom: 8px;
        }
        .mod-desc {
          font-family: var(--font-sans); font-size: 13px; font-weight: 400;
          color: var(--text-muted); line-height: 1.6; margin-bottom: 20px;
        }
        .mod-fns { display: flex; flex-direction: column; gap: 5px; }
        .fn-row {
          display: flex; align-items: center; gap: 7px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
        }
        .fn-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--accent); opacity: 0.65; flex-shrink: 0; }

        /* ── Steps ── */
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 28px; }
        .step { display: flex; flex-direction: column; gap: 14px; }
        .step-num {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px; letter-spacing: 0.09em; text-transform: uppercase;
        }
        .step-tag {
          display: inline-flex; align-items: center; padding: 3px 9px;
          background: var(--accent-dim); border: 1px solid var(--accent-border);
          border-radius: 20px; font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: var(--accent); line-height: 15px;
          letter-spacing: 0.05em; text-transform: uppercase; width: fit-content;
        }
        .step-title {
          font-family: var(--font-tight); font-size: 18px; font-weight: 600;
          color: var(--text); letter-spacing: -0.02em; line-height: 1.2;
        }
        .step-desc {
          font-family: var(--font-sans); font-size: 13px; font-weight: 400;
          color: var(--text-muted); line-height: 1.65;
        }

        /* ── Nodes ── */
        .nodes-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 7px; }
        .node-chip {
          padding: 9px 13px; background: var(--bg-2);
          border: 1px solid var(--border); border-radius: 5px;
          display: flex; align-items: center; gap: 9px;
          transition: all 0.15s; cursor: default;
        }
        .node-chip:hover { border-color: var(--border-2); background: var(--bg-3); transform: translateY(-1px); }
        .node-em { font-size: 13px; line-height: 1; flex-shrink: 0; }
        .node-lbl {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
        }

        /* ── CTA ── */
        .cta-block {
          margin: 0 28px 72px; padding: 56px 44px;
          background: var(--bg-2); border: 1px solid var(--border); border-radius: 7px;
          display: flex; align-items: center; justify-content: space-between; gap: 28px;
        }
        .cta-left h2 {
          font-family: var(--font-tight); font-size: 32px; font-weight: 700;
          color: var(--text); letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 10px;
        }
        .cta-left p {
          font-family: var(--font-sans); font-size: 14px; font-weight: 400;
          color: var(--text-muted); line-height: 1.65; max-width: 380px;
        }
        .cta-right { display: flex; flex-direction: column; gap: 9px; flex-shrink: 0; }

        /* ── Footer ── */
        .hr { height: 1px; background: var(--border); }
        .footer {
          border-top: 1px solid var(--border); padding: 20px 28px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .footer-l { display: flex; align-items: center; gap: 14px; }
        .footer-name {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text-dim); letter-spacing: 0.02em;
        }
        .footer-links { display: flex; gap: 14px; }
        .footer-links a {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px; text-decoration: none; transition: color 0.15s;
        }
        .footer-links a:hover { color: var(--text-muted); }
        .footer-badge {
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: var(--accent); line-height: 15px; padding: 3px 9px;
          background: var(--accent-dim); border: 1px solid var(--accent-border);
          border-radius: 20px; letter-spacing: 0.05em; text-transform: uppercase;
        }

        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
        .fu { opacity:0; transform:translateY(14px); animation: fadeUp 0.45s ease forwards; }
      `}</style>

      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-left">
          <div className="nav-logo"><Network size={16} /></div>
          <span className="nav-wordmark">INITIATE AI S1</span>
          <div className="nav-divider" />
          <span className="nav-sub">Initia Native DeFi Automation</span>
        </div>
        <div className="nav-right">
          <button className="theme-btn" onClick={toggle} aria-label="Toggle theme">
            <div className={`ti${theme === "light" ? " filled" : ""}`} />
            {theme === "dark" ? "light" : "dark"}
          </button>
          <Link href="/auth" className="btn-ghost">Sign In</Link>
          <Link href="/workflow" className="btn-primary">Launch Builder</Link>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <div className="ticker-wrap">
        <div className="ticker">
          {[
            "InterwovenKit Integrated",".init Username Resolution","Interwoven Bridge Node",
            "Escrow-Safe Transfers","Auto-Signing Session UX","Groq LLM Runtime",
            "Initia Appchain Deployed","No-Code Agent Builder",
            "InterwovenKit Integrated",".init Username Resolution","Interwoven Bridge Node",
            "Escrow-Safe Transfers","Auto-Signing Session UX","Groq LLM Runtime",
            "Initia Appchain Deployed","No-Code Agent Builder",
          ].map((t, i) => (
            <div key={i} className="tick-item"><div className="tick-dot" />{t}</div>
          ))}
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="hero">
        <motion.div className="hero-eyebrow fu" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.05}}>
          Initia Hackathon Season 1
        </motion.div>
        <motion.h1 initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
          <span className="headline-line">Build AI Agents That Execute</span><br /><span className="muted">Secure Payments.</span>
        </motion.h1>
        <motion.p className="hero-desc" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.15}}>
          Unified production system combining AgentFlow orchestration and SecurePay contract flows
          with Initia wallet UX, .init resolution, and auditable payment lifecycle.
        </motion.p>
        <motion.div className="hero-actions" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}}>
          <Link href="/workflow" className="btn-hero-primary">Open Workflow Canvas <ArrowRight size={14} /></Link>
          <Link href="/dashboard" className="btn-hero-ghost">Open Unified Dashboard</Link>
        </motion.div>
        <motion.div className="initia-badges" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.25}}>
          {["InterwovenKit",".init Usernames","Interwoven Bridge","Auto-Signing Session UX","Custom Appchain"].map(b => (
            <div key={b} className="ibadge"><span className="ck">✓</span>{b}</div>
          ))}
        </motion.div>
      </section>

      {/* ── Stats ── */}
      <div className="stats">
        {([ ["3×","Contract modules"], ["11","DeFi action nodes"], ["0","Lines of code to automate"], ["100ms","Initia block time"] ] as [string,string][]).map(([v,l]) => (
          <div key={l} className="stat">
            <div className="stat-val">{v}</div>
            <div className="stat-lbl">{l}</div>
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="section">
        <div className="section-lbl">Core capabilities</div>
        <div className="feat-grid">
          {[
            { Icon: Workflow,   title:"Agent Orchestration", desc:"Visual workflow compiler with retry-aware execution. Drag nodes, connect edges, hit compile — agent is live." },
            { Icon: Shield,     title:"Secure Pay Dock",     desc:"Fraud checks, encrypted remarks, and transaction audit logs. Every payment escrowed until recipient claims." },
            { Icon: Bot,        title:"LLM Automation",      desc:"Groq-powered decision runtime mapped to on-chain actions. Natural language → contract calls." },
            { Icon: GitBranch,  title:"Interwoven Bridge",   desc:"Bridge assets from any chain into Initia directly from a canvas node. No manual bridging friction." },
            { Icon: Globe,      title:".init Usernames",     desc:"Send to alice.init, not 0x3f2... Initia Name Service resolution built into every payment node." },
            { Icon: Zap,        title:"Auto-Signing UX",     desc:"InterwovenKit session UX means agents execute approved transactions without prompting every time." },
          ].map(({ Icon, title, desc }) => (
            <div key={title} className="feat-card">
              <div className="feat-icon"><Icon size={15} /></div>
              <div className="feat-title">{title}</div>
              <div className="feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hr" />

      {/* ── Modules ── */}
      <section className="section">
        <div className="section-lbl">Smart contract modules</div>
        <div className="mods-row">
          {[
            { tag:"Module 01", title:"SecureTransfer", desc:"Escrow-based P2P payments held until recipient claims. 7-day expiry with full refund safety.",        fns:["sendTransfer()","claimTransfer()","refundTransfer()"] },
            { tag:"Module 02", title:"GroupPayment",   desc:"Multi-contributor pools with a target. Auto-distributes to beneficiary when the goal is reached.",     fns:["createGroup()","contributeToGroup()","auto-distribute"] },
            { tag:"Module 03", title:"SavingsPot",     desc:"Goal-based personal savings with progress tracking. Optional yield routing to Initia LP pools.",      fns:["createPot()","depositToPot()","withdrawFromPot()"] },
          ].map(m => (
            <div key={m.title} className="mod-card">
              <div className="mod-tag">{m.tag}</div>
              <div className="mod-title">{m.title}</div>
              <div className="mod-desc">{m.desc}</div>
              <div className="mod-fns">{m.fns.map(f => <div key={f} className="fn-row"><div className="fn-dot"/>{f}</div>)}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hr" />

      {/* ── How it works ── */}
      <section className="section">
        <div className="section-lbl">How it works</div>
        <div className="steps">
          {[
            { n:"Step 01", tag:"No code",  title:"Design on the canvas",     desc:"Drag DeFi nodes onto the workflow canvas. Connect SendPayment, SavingsPot, or BridgeAsset nodes with conditional If/Else logic." },
            { n:"Step 02", tag:"One click",title:"Compile into a live agent", desc:"Hit compile. The node graph converts into a Groq-powered system prompt with a full DeFi action registry." },
            { n:"Step 03", tag:"On-chain", title:"Chat — watch it execute",   desc:"Talk in plain English. It decides which contract to call, signs with InterwovenKit, and returns the tx hash inline." },
          ].map(s => (
            <div key={s.n} className="step">
              <div className="step-num">{s.n}</div>
              <div className="step-tag">{s.tag}</div>
              <div className="step-title">{s.title}</div>
              <div className="step-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="hr" />

      {/* ── Nodes ── */}
      <section className="section">
        <div className="section-lbl">Available DeFi nodes</div>
        <div className="nodes-grid">
          {([ ["💸","SendPayment"],["✅","ClaimPayment"],["↩","RefundPayment"],["👥","CreateGroup"],
               ["➕","ContributeGroup"],["🏦","CreatePot"],["💰","DepositPot"],["📤","WithdrawPot"],
               ["🌉","BridgeAsset"],["📊","BalanceCheck"],["🔍","ResolveUsername"],["＋","More soon"],
          ] as [string,string][]).map(([em, lbl], i) => (
            <div key={lbl} className="node-chip" style={i===11?{opacity:.3}:{}}>
              <div className="node-em">{em}</div>
              <div className="node-lbl">{lbl}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="cta-block">
        <div className="cta-left">
          <h2>Start building your<br />DeFi agent today.</h2>
          <p>No blockchain expertise required. Connect your wallet, drag a few nodes, and your first automated payment agent is running on Initia in minutes.</p>
        </div>
        <div className="cta-right">
          <Link href="/workflow" className="btn-hero-primary">Open Workflow Canvas <ArrowRight size={14} /></Link>
          <Link href="/dashboard" className="btn-hero-ghost">Open Unified Dashboard</Link>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer-l">
          <span className="footer-name">INITIATE AI S1</span>
          <div className="footer-links">
            <a href="#">Docs</a>
            <a href="#">GitHub</a>
            <a href="#">Discord</a>
          </div>
        </div>
        <div className="footer-badge">Season 1</div>
      </footer>
    </>
  );
}