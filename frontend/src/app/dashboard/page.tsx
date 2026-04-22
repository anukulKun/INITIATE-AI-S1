"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent } from "react";
import { api, readSessionUser } from "@/lib/api";
import { useUsernameResolver } from "@/hooks/useUsernameResolver";

type Transfer = { id: string; status: string; recipient: string; amount_wei: string; tx_hash: string };

export default function DashboardPage() {
  const user = useMemo(() => (typeof window !== "undefined" ? readSessionUser() : null), []);
  const [workflowId, setWorkflowId] = useState("");
  const [recipient, setRecipient] = useState("alice.init");
  const [amountWei, setAmountWei] = useState("10000000000000000");
  const [remark, setRemark] = useState("Weekly auto-save");
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [chatWorkflowId, setChatWorkflowId] = useState("");
  const [chatMessage, setChatMessage] = useState("If balance is high, move funds to savings pot.");
  const [chatResponse, setChatResponse] = useState("");

  const resolved = useUsernameResolver(recipient);

  async function reload() {
    if (!user?.walletAddress) return;
    const result = await api.getTransfers(user.walletAddress);
    setTransfers(result.items || []);
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  async function sendTransfer() {
    const payload = {
      workflowId: workflowId || undefined,
      recipient,
      amountWei,
      remark,
    };
    await api.transfer(payload);
    await reload();
  }

  async function runAgent() {
    const result = await api.chat(chatWorkflowId, chatMessage);
    setChatResponse(JSON.stringify(result, null, 2));
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8">
      <h1 className="text-3xl font-black">Unified Operations Dashboard</h1>
      <p className="mt-1 text-sm text-gray-400">Monitor workflow executions and on-chain transactions in one place.</p>

      <section className="mt-6 grid gap-5 md:grid-cols-2">
        <div className="card p-4">
          <h2 className="text-lg font-semibold">Secure Transfer</h2>
          <div className="mt-3 space-y-2">
            <input className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" placeholder="Workflow ID" value={workflowId} onChange={(e: ChangeEvent<HTMLInputElement>) => setWorkflowId(e.target.value)} />
            <input className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" placeholder="Recipient (.init or address)" value={recipient} onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value)} />
            <input className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" placeholder="Amount in wei" value={amountWei} onChange={(e: ChangeEvent<HTMLInputElement>) => setAmountWei(e.target.value)} />
            <input className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" placeholder="Remark" value={remark} onChange={(e: ChangeEvent<HTMLInputElement>) => setRemark(e.target.value)} />
            <p className="text-xs text-gray-400">
              Resolver: {resolved.loading ? "resolving..." : resolved.address || "not resolved"}
            </p>
            <button className="rounded-md bg-brand-neon px-4 py-2 font-semibold text-black" onClick={sendTransfer}>
              Initiate Transfer
            </button>
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-lg font-semibold">Agent Chat Execution</h2>
          <div className="mt-3 space-y-2">
            <input className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" placeholder="Workflow ID" value={chatWorkflowId} onChange={(e: ChangeEvent<HTMLInputElement>) => setChatWorkflowId(e.target.value)} />
            <textarea className="h-24 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2" value={chatMessage} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setChatMessage(e.target.value)} />
            <button className="rounded-md border border-white/20 px-4 py-2" onClick={runAgent}>
              Run Agent
            </button>
            <pre className="max-h-52 overflow-auto rounded-md bg-black/40 p-3 text-xs text-gray-200">{chatResponse || "No response yet"}</pre>
          </div>
        </div>
      </section>

      <section className="card mt-6 p-4">
        <h2 className="text-lg font-semibold">Transfer History</h2>
        <div className="mt-3 overflow-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th className="px-2 py-2">ID</th>
                <th className="px-2 py-2">Status</th>
                <th className="px-2 py-2">Recipient</th>
                <th className="px-2 py-2">Amount (wei)</th>
                <th className="px-2 py-2">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id} className="border-t border-white/10">
                  <td className="px-2 py-2">{t.id}</td>
                  <td className="px-2 py-2">{t.status}</td>
                  <td className="px-2 py-2">{t.recipient}</td>
                  <td className="px-2 py-2">{t.amount_wei}</td>
                  <td className="px-2 py-2">{t.tx_hash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

