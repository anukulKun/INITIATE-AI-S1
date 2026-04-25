"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Network, ArrowLeft, ArrowRight,
  Send, Bot, RefreshCw, ExternalLink,
  Clock, CheckCircle2, XCircle, Loader2,
} from "lucide-react";
import { api, readSessionUser } from "@/lib/api";
import { useUsernameResolver } from "@/hooks/useUsernameResolver";

type Transfer = {
  id: string;
  status: string;
  recipient: string;
  amount_wei: string;
  tx_hash: string;
};

const STATUS_ICON: Record<string, React.ReactNode> = {
  claimed:  <CheckCircle2 size={11} />,
  pending:  <Clock size={11} />,
  refunded: <XCircle size={11} />,
};

export default function DashboardPage() {
  const user = useMemo(
    () => (typeof window !== "undefined" ? readSessionUser() : null),
    []
  );

  const [workflowId, setWorkflowId] = useState("");
  const [recipient,  setRecipient]  = useState("alice.init");
  const [amountWei,  setAmountWei]  = useState("10000000000000000");
  const [remark,     setRemark]     = useState("Weekly auto-save");
  const [txSending,  setTxSending]  = useState(false);
  const [txResult,   setTxResult]   = useState<string | null>(null);

  const [chatWorkflowId, setChatWorkflowId] = useState("");
  const [chatMessage,    setChatMessage]    = useState("If balance is high, move funds to savings pot.");
  const [chatResponse,   setChatResponse]   = useState("");
  const [chatLoading,    setChatLoading]    = useState(false);

  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const resolved = useUsernameResolver(recipient);

  async function reload() {
    if (!user?.walletAddress) return;
    setLoadingTx(true);
    try {
      const result = await api.getTransfers(user.walletAddress);
      setTransfers(result.items || []);
    } finally {
      setLoadingTx(false);
    }
  }

  useEffect(() => { reload().catch(() => {}); }, []);

  async function sendTransfer() {
    setTxSending(true); setTxResult(null);
    try {
      const res = await api.transfer({ workflowId: workflowId || undefined, recipient, amountWei, remark });
      setTxResult(res?.tx_hash || "success");
      await reload();
    } catch (e: any) {
      setTxResult("error: " + (e?.message || "unknown"));
    } finally { setTxSending(false); }
  }

  async function runAgent() {
    setChatLoading(true); setChatResponse("");
    try {
      const result = await api.chat(chatWorkflowId, chatMessage);
      setChatResponse(JSON.stringify(result, null, 2));
      if (result?.actionResult?.txHash) {
        await reload();
      }
    } catch (e: any) {
      setChatResponse("error: " + (e?.message || "unknown"));
    } finally { setChatLoading(false); }
  }

  const shortHash = (h: string) =>
    h ? `${h.slice(0, 8)}...${h.slice(-6)}` : "—";

  const statusClass = (s: string) => {
    if (s === "claimed")  return "chip-green";
    if (s === "pending")  return "chip-yellow";
    if (s === "refunded") return "chip-red";
    return "chip-default";
  };

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
          --accent:          #adff2f;
          --accent-fg:       #000000;
          --accent-dim:      rgba(173,255,47,0.12);
          --accent-border:   rgba(173,255,47,0.2);
          --font-sans:  'Geist', ui-sans-serif, system-ui, sans-serif;
          --font-tight: 'Inter Tight', ui-sans-serif, sans-serif;
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
          --accent:        #1a6b00;
          --accent-fg:     #ffffff;
          --accent-dim:    rgba(26,107,0,0.09);
          --accent-border: rgba(26,107,0,0.22);
        }

        html, body {
          font-family: var(--font-sans);
          background: var(--bg); color: var(--text);
          font-size: 16px; -webkit-font-smoothing: antialiased;
          transition: background 0.25s, color 0.25s;
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }

        /* ── Nav ── */
        .nav {
          position: sticky; top: 0; z-index: 50;
          height: 52px; display: flex; align-items: center; justify-content: space-between;
          padding: 0 28px; background: var(--bg);
          border-bottom: 1px solid var(--border); transition: background 0.25s;
        }
        .nav-l { display: flex; align-items: center; gap: 10px; }
        .nav-logo {
          width: 28px; height: 28px; background: var(--accent);
          border-radius: 6px; display: grid; place-items: center;
          color: var(--accent-fg);
        }
        .nav-wm {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); letter-spacing: 0.02em; line-height: 20px;
        }
        .nav-div { width: 1px; height: 18px; background: var(--border-2); margin: 0 4px; }
        .nav-crumb {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119); line-height: 15px;
        }
        .nav-r { display: flex; align-items: center; gap: 8px; }

        .pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 11px;
          font-family: var(--font-mono); font-size: 10px; font-weight: 400;
          color: rgb(119,119,119); line-height: 15px;
          background: var(--bg-2); border: 1px solid var(--border-2);
          border-radius: 5px; cursor: pointer; text-decoration: none;
          transition: color 0.15s;
        }
        .pill:hover { color: var(--text-muted); }

        /* ── Page ── */
        .pg { max-width: 1160px; margin: 0 auto; padding: 40px 28px 80px; }

        .pg-eyebrow {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119);
          line-height: 15px; letter-spacing: 0.09em; text-transform: uppercase;
          display: flex; align-items: center; gap: 10px; margin-bottom: 10px;
        }
        .pg-eyebrow::before { content:''; width:20px; height:1px; background:rgb(119,119,119); }
        .pg-title {
          font-family: var(--font-tight); font-size: 30px; font-weight: 700;
          color: var(--text); letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 6px;
        }
        .pg-sub {
          font-family: var(--font-sans); font-size: 14px; color: var(--text-muted);
          line-height: 1.6; margin-bottom: 36px;
        }

        /* ── Stats row ── */
        .stats {
          display: grid; grid-template-columns: repeat(3,1fr);
          border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 1px;
        }
        .stat { padding: 18px 22px; border-right: 1px solid var(--border); }
        .stat:last-child { border-right: none; }
        .stat-v {
          font-family: var(--font-sans); font-size: 22px; font-weight: 700;
          letter-spacing: -0.02em; color: var(--text); line-height: 1;
        }
        .stat-v span { color: var(--accent); }
        .stat-l {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119);
          line-height: 15px; margin-top: 4px;
        }

        /* ── Two-col panels ── */
        .two-col {
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 1px; background: var(--border);
          border: 1px solid var(--border); border-radius: 0 0 0 0;
          overflow: hidden; margin-bottom: 1px;
        }
        .panel { background: var(--bg); padding: 26px; }
        .panel-t {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); line-height: 20px; margin-bottom: 3px;
        }
        .panel-s {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119);
          line-height: 15px; margin-bottom: 20px;
        }

        /* ── Fields ── */
        .fl { display: flex; flex-direction: column; gap: 4px; margin-bottom: 10px; }
        .fl-lbl {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119);
          line-height: 15px; letter-spacing: 0.05em; text-transform: uppercase;
        }
        .fl-input {
          width: 100%; padding: 8px 11px;
          font-family: var(--font-mono); font-size: 12px; color: var(--text);
          background: var(--bg-2); border: 1px solid var(--border-2); border-radius: 5px;
          outline: none; transition: border-color 0.15s; line-height: 18px;
        }
        .fl-input::placeholder { color: var(--text-dim); }
        .fl-input:focus { border-color: var(--accent); }
        .fl-ta {
          width: 100%; padding: 8px 11px; resize: vertical; min-height: 80px;
          font-family: var(--font-sans); font-size: 13px; color: var(--text);
          background: var(--bg-2); border: 1px solid var(--border-2); border-radius: 5px;
          outline: none; transition: border-color 0.15s; line-height: 1.5;
        }
        .fl-ta::placeholder { color: var(--text-dim); }
        .fl-ta:focus { border-color: var(--accent); }

        /* ── Resolver ── */
        .res-hint {
          display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119); line-height: 15px;
        }
        .res-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .rd-none  { background: rgb(119,119,119); }
        .rd-load  { background: #ca8a04; animation: pulse 1.2s ease-in-out infinite; }
        .rd-ok    { background: #16a34a; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        /* ── Buttons ── */
        .btn-acc {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 8px 16px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border: none; border-radius: 5px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s; line-height: 20px;
        }
        .btn-acc:hover:not(:disabled) { opacity: 0.86; transform: translateY(-1px); }
        .btn-acc:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-gst {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          width: 100%; padding: 8px 16px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: transparent;
          border: 1px solid var(--border-2); border-radius: 5px; cursor: pointer;
          transition: all 0.15s; line-height: 20px;
        }
        .btn-gst:hover:not(:disabled) { color: var(--text); background: var(--bg-2); }
        .btn-gst:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Result / pre ── */
        .tx-box {
          margin-top: 10px; padding: 10px 12px;
          font-family: var(--font-mono); font-size: 10px; line-height: 15px;
          background: var(--bg-3); border: 1px solid var(--border); border-radius: 5px;
          word-break: break-all; color: rgb(119,119,119);
        }
        .tx-ok  { border-color: rgba(22,163,74,.3);  color:#16a34a; background:rgba(22,163,74,.05); }
        .tx-err { border-color: rgba(220,38,38,.3);  color:#dc2626; background:rgba(220,38,38,.05); }

        .agent-pre {
          margin-top: 10px; padding: 12px;
          font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); line-height: 1.6;
          background: var(--bg-3); border: 1px solid var(--border); border-radius: 5px;
          max-height: 180px; overflow-y: auto; white-space: pre-wrap; word-break: break-all;
        }

        /* ── History ── */
        .hist {
          background: var(--bg); border: 1px solid var(--border); border-radius: 8px;
          overflow: hidden; margin-top: 1px;
        }
        .hist-hdr {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; border-bottom: 1px solid var(--border);
        }
        .hist-t {
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text); line-height: 20px;
        }
        .hist-m {
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119); line-height: 15px;
        }

        .refresh-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 10px;
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119); line-height: 15px;
          background: var(--bg-2); border: 1px solid var(--border); border-radius: 5px;
          cursor: pointer; transition: color 0.15s;
        }
        .refresh-btn:hover { color: var(--text-muted); }
        .refresh-btn.spinning svg { animation: spin 1s linear infinite; }

        table { width: 100%; border-collapse: collapse; }
        th {
          padding: 9px 16px; text-align: left;
          font-family: var(--font-mono); font-size: 10px; color: rgb(119,119,119);
          line-height: 15px; letter-spacing: 0.06em; text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 11px 16px;
          font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); line-height: 15px;
          border-bottom: 1px solid var(--border);
        }
        tbody tr:last-child td { border-bottom: none; }
        tbody tr { transition: background 0.1s; }
        tbody tr:hover td { background: var(--bg-2); }

        .chip {
          display: inline-flex; align-items: center; gap: 4px;
          padding: 2px 8px; border-radius: 20px; border: 1px solid;
          font-family: var(--font-mono); font-size: 10px; line-height: 15px;
        }
        .chip-green  { color:#16a34a; border-color:rgba(22,163,74,.3);  background:rgba(22,163,74,.06); }
        .chip-yellow { color:#ca8a04; border-color:rgba(202,138,4,.3);  background:rgba(202,138,4,.06); }
        .chip-red    { color:#dc2626; border-color:rgba(220,38,38,.3);  background:rgba(220,38,38,.06); }
        .chip-default{ color:rgb(119,119,119); border-color:var(--border-2); background:var(--bg-3); }

        .tx-lnk {
          display: inline-flex; align-items: center; gap: 4px;
          color: var(--text-muted); text-decoration: none; transition: color 0.15s;
        }
        .tx-lnk:hover { color: var(--accent); }

        .empty {
          padding: 48px 22px; text-align: center;
          font-family: var(--font-mono); font-size: 10px;
          color: rgb(119,119,119); line-height: 15px;
        }

        /* ── Rounded corners gluing panels together ── */
        .two-col { border-radius: 8px 8px 0 0; }
        .hist    { border-radius: 0 0 8px 8px; border-top: none; }

        /* ── Footer actions ── */
        .ft-actions { display: flex; gap: 10px; margin-top: 24px; }
        .ft-btn-acc {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--accent-fg); background: var(--accent);
          border-radius: 5px; text-decoration: none; line-height: 20px; transition: opacity 0.15s;
        }
        .ft-btn-acc:hover { opacity: 0.86; }
        .ft-btn-gst {
          display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px;
          font-family: var(--font-tight); font-size: 13px; font-weight: 600;
          color: var(--text-muted); background: transparent;
          border: 1px solid var(--border-2); border-radius: 5px;
          text-decoration: none; line-height: 20px; transition: all 0.15s;
        }
        .ft-btn-gst:hover { color: var(--text); background: var(--bg-2); }
      `}</style>

      {/* ── Nav ── */}
      <nav className="nav">
        <div className="nav-l">
          <div className="nav-logo"><Network size={14} /></div>
          <span className="nav-wm">INITIATE AI S1</span>
          <div className="nav-div" />
          <span className="nav-crumb">dashboard</span>
        </div>
        <div className="nav-r">
          <Link href="/workflow" className="pill"><ArrowLeft size={10} /> Workflow</Link>
          <Link href="/" className="pill">Home</Link>
        </div>
      </nav>

      <div className="pg">

        {/* Page header */}
        <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.05}}>
          <div className="pg-eyebrow">Operations</div>
          <h1 className="pg-title">Unified Dashboard</h1>
          <p className="pg-sub">Monitor workflow executions and on-chain transactions in one place.</p>
        </motion.div>

        {/* Stats */}
        <motion.div className="stats" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.1}}>
          <div className="stat">
            <div className="stat-v">{transfers.length}</div>
            <div className="stat-l">Total transfers</div>
          </div>
          <div className="stat">
            <div className="stat-v">{transfers.filter(t=>t.status==="claimed").length}</div>
            <div className="stat-l">Claimed</div>
          </div>
          <div className="stat">
            <div className="stat-v">{transfers.filter(t=>t.status==="pending").length}</div>
            <div className="stat-l">Pending</div>
          </div>
        </motion.div>

        {/* Panels */}
        <motion.div className="two-col" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.15}}>

          {/* Transfer */}
          <div className="panel">
            <div className="panel-t">Secure Transfer</div>
            <div className="panel-s">Escrow-protected on-chain payment</div>

            <div className="fl">
              <div className="fl-lbl">Workflow ID</div>
              <input className="fl-input" placeholder="optional"
                value={workflowId}
                onChange={(e:ChangeEvent<HTMLInputElement>)=>setWorkflowId(e.target.value)} />
            </div>
            <div className="fl">
              <div className="fl-lbl">Recipient</div>
              <input className="fl-input" placeholder="alice.init or 0x..."
                value={recipient}
                onChange={(e:ChangeEvent<HTMLInputElement>)=>setRecipient(e.target.value)} />
            </div>

            <div className="res-hint">
              <div className={`res-dot ${resolved.loading?"rd-load":resolved.address?"rd-ok":"rd-none"}`} />
              {resolved.loading ? "resolving..." : resolved.address || "not resolved"}
            </div>

            <div className="fl">
              <div className="fl-lbl">Amount (wei)</div>
              <input className="fl-input" placeholder="10000000000000000"
                value={amountWei}
                onChange={(e:ChangeEvent<HTMLInputElement>)=>setAmountWei(e.target.value)} />
            </div>
            <div className="fl" style={{marginBottom:16}}>
              <div className="fl-lbl">Remark</div>
              <input className="fl-input" placeholder="Weekly auto-save"
                value={remark}
                onChange={(e:ChangeEvent<HTMLInputElement>)=>setRemark(e.target.value)} />
            </div>

            <button className="btn-acc" onClick={sendTransfer} disabled={txSending}>
              {txSending
                ? <><Loader2 size={13} style={{animation:"spin 1s linear infinite"}} />Sending...</>
                : <><Send size={13} />Initiate Transfer</>}
            </button>

            {txResult && (
              <div className={`tx-box ${txResult.startsWith("error")?"tx-err":"tx-ok"}`}>
                {txResult.startsWith("error") ? txResult : `tx: ${txResult}`}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="panel">
            <div className="panel-t">Agent Chat Execution</div>
            <div className="panel-s">Natural-language instructions to the compiled agent</div>

            <div className="fl">
              <div className="fl-lbl">Workflow ID</div>
              <input className="fl-input" placeholder="workflow-id"
                value={chatWorkflowId}
                onChange={(e:ChangeEvent<HTMLInputElement>)=>setChatWorkflowId(e.target.value)} />
            </div>
            <div className="fl" style={{marginBottom:16}}>
              <div className="fl-lbl">Message</div>
              <textarea className="fl-ta"
                value={chatMessage}
                onChange={(e:ChangeEvent<HTMLTextAreaElement>)=>setChatMessage(e.target.value)} />
            </div>

            <button className="btn-gst" onClick={runAgent} disabled={chatLoading}>
              {chatLoading
                ? <><Loader2 size={13} style={{animation:"spin 1s linear infinite"}} />Running...</>
                : <><Bot size={13} />Run Agent</>}
            </button>

            <pre className="agent-pre">{chatResponse || "No response yet"}</pre>
          </div>

        </motion.div>

        {/* History */}
        <motion.div className="hist" initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{delay:.2}}>
          <div className="hist-hdr">
            <div>
              <div className="hist-t">Transfer History</div>
              <div className="hist-m">{transfers.length} record{transfers.length !== 1 ? "s" : ""}</div>
            </div>
            <button className={`refresh-btn${loadingTx?" spinning":""}`} onClick={reload}>
              <RefreshCw size={10} />Refresh
            </button>
          </div>

          {transfers.length === 0 ? (
            <div className="empty">
              No transfers found for this wallet.<br />
              Initiate a transfer above to get started.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Status</th><th>Recipient</th>
                  <th>Amount (wei)</th><th>Tx Hash</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td style={{color:"var(--text-dim)"}}>{t.id}</td>
                    <td>
                      <span className={`chip ${statusClass(t.status)}`}>
                        {STATUS_ICON[t.status] ?? null}
                        {t.status}
                      </span>
                    </td>
                    <td>{t.recipient}</td>
                    <td>{t.amount_wei}</td>
                    <td>
                      {t.tx_hash ? (
                        <a
                          className="tx-lnk"
                          href={`https://explorer.testnet.initia.xyz/tx/${t.tx_hash}`}
                          target="_blank" rel="noopener noreferrer"
                        >
                          {shortHash(t.tx_hash)}<ExternalLink size={9} />
                        </a>
                      ) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Footer actions */}
        <div className="ft-actions">
          <Link href="/workflow" className="ft-btn-acc">
            Open Workflow Canvas <ArrowRight size={13} />
          </Link>
          <Link href="/" className="ft-btn-gst">
            <ArrowLeft size={13} /> Back to Home
          </Link>
        </div>

      </div>
    </>
  );
}