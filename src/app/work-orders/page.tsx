"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { storageKeys, useLocalStorageState } from "../../lib/useLocalStorageState";
import type { Priority, WorkOrder, WorkOrderStatus } from "../../lib/types";

const card: React.CSSProperties = { border: "1px solid #e6e6e6", borderRadius: 14, background: "white", padding: 14 };
const input: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #ddd" };

export default function WorkOrdersPage() {
  const [workOrders, setWorkOrders] = useLocalStorageState<WorkOrder[]>(storageKeys.workOrders, []);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<WorkOrderStatus | "All">("All");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [tracking, setTracking] = useState<string | "All">("All");
  const [respOrg, setRespOrg] = useState<string | "All">("All");

  const trackingOptions = useMemo(() => {
    const s = new Set<string>();
    for (const w of workOrders) if (w.trackingStatus) s.add(w.trackingStatus);
    return ["All", ...Array.from(s).sort()];
  }, [workOrders]);

  const respOrgOptions = useMemo(() => {
    const s = new Set<string>();
    for (const w of workOrders) if (w.respOrg) s.add(w.respOrg);
    return ["All", ...Array.from(s).sort()];
  }, [workOrders]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return workOrders
      .filter((w) => (status === "All" ? true : w.status === status))
      .filter((w) => (priority === "All" ? true : w.priority === priority))
      .filter((w) => (tracking === "All" ? true : (w.trackingStatus ?? "") === tracking))
      .filter((w) => (respOrg === "All" ? true : (w.respOrg ?? "") === respOrg))
      .filter((w) => {
        if (!query) return true;
        const blob = [
          w.title,
          w.wtId,
          w.facilityNumber,
          w.customerName,
          w.taskName,
          w.description,
          w.trackingStatus,
          w.respOrg,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      })
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  }, [workOrders, q, status, priority, tracking, respOrg]);

  function patch(id: string, p: Partial<WorkOrder>) {
    const now = new Date().toISOString();
    setWorkOrders(workOrders.map((w) => (w.id === id ? { ...w, ...p, updatedAt: now } : w)));
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>Work Orders</h1>
          <div style={{ marginTop: 6, opacity: 0.75 }}>
            {workOrders.length === 0 ? (
              <>No data yet. Go to <Link href="/settings">Settings</Link> to import your Excel.</>
            ) : (
              <>Showing <b>{filtered.length}</b> of <b>{workOrders.length}</b></>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/settings" style={btnLink}>Import Excel</Link>
          <Link href="/" style={btnLink}>← Home</Link>
        </div>
      </header>

      <section style={{ marginTop: 12, display: "grid", gap: 8 }}>
        <input style={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search WT-ID, facility, text…" />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
          <select style={input} value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <select style={input} value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select style={input} value={tracking} onChange={(e) => setTracking(e.target.value)}>
            {trackingOptions.map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Tracking Status" : t}</option>
            ))}
          </select>

          <select style={input} value={respOrg} onChange={(e) => setRespOrg(e.target.value)}>
            {respOrgOptions.map((t) => (
              <option key={t} value={t}>{t === "All" ? "All Resp Org" : t}</option>
            ))}
          </select>
        </div>
      </section>

      <section style={{ marginTop: 12, display: "grid", gap: 10 }}>
        {filtered.map((w) => (
          <div key={w.id} style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 240 }}>
                <div style={{ fontWeight: 900 }}>{w.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                  {w.wtId ? <>WT {w.wtId} • </> : null}
                  {w.facilityNumber ? <>Fac {w.facilityNumber} • </> : null}
                  {w.priority} • {w.status}
                  {w.trackingStatus ? <> • {w.trackingStatus}</> : null}
                </div>
                {w.customerName || w.respOrg ? (
                  <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
                    {w.customerName ? <>Customer: {w.customerName}</> : null}
                    {w.customerName && w.respOrg ? " • " : null}
                    {w.respOrg ? <>Resp Org: {w.respOrg}</> : null}
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <button style={btn} onClick={() => patch(w.id, { status: "Open" })}>Open</button>
                <button style={btn} onClick={() => patch(w.id, { status: "In Progress" })}>Start</button>
                <button style={btn} onClick={() => patch(w.id, { status: "Done" })}>Done</button>
              </div>
            </div>

            <details style={{ marginTop: 10 }}>
              <summary style={{ cursor: "pointer", fontWeight: 800 }}>Details / Notes</summary>
              <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
                {w.description ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>Description</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{w.description}</div>
                  </div>
                ) : null}

                {w.resolutionDescription ? (
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>WT Resolution Description</div>
                    <div style={{ whiteSpace: "pre-wrap" }}>{w.resolutionDescription}</div>
                  </div>
                ) : null}

                <div>
                  <div style={{ fontSize: 12, fontWeight: 900, opacity: 0.7 }}>Your Notes</div>
                  <textarea
                    value={w.notes ?? ""}
                    onChange={(e) => patch(w.id, { notes: e.target.value })}
                    rows={3}
                    style={{ ...input, marginTop: 6 }}
                    placeholder="Add your notes here…"
                  />
                </div>
              </div>
            </details>
          </div>
        ))}
      </section>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #ddd",
  background: "white",
  fontWeight: 800,
};

const btnLink: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  fontWeight: 800,
  textDecoration: "none",
  color: "inherit",
  display: "inline-block",
};

