"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { storageKeys, useLocalStorageState } from "../../lib/useLocalStorageState";
import type { Priority, WorkOrder, WorkOrderStatus } from "../../lib/types";

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
    <main className="container stack">
      <header className="row">
        <div>
          <h1 className="h1">Work Orders</h1>
          <div className="sub">
            {workOrders.length === 0 ? (
              <>
                No data yet. Go to <Link href="/settings">Settings</Link> to import your Excel.
              </>
            ) : (
              <>
                Showing <b>{filtered.length}</b> of <b>{workOrders.length}</b>
              </>
            )}
          </div>
        </div>

        <div className="rowLeft">
          <Link href="/settings" className="btn" style={{ textDecoration: "none" }}>
            Import Excel
          </Link>
          <Link href="/" className="btn" style={{ textDecoration: "none" }}>
            ← Home
          </Link>
        </div>
      </header>

      <section className="card stack">
        <input
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search WT-ID, facility, customer, text…"
        />

        <div className="grid2">
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="All">All Status</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          <select className="input" value={priority} onChange={(e) => setPriority(e.target.value as any)}>
            <option value="All">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select className="input" value={tracking} onChange={(e) => setTracking(e.target.value)}>
            {trackingOptions.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Tracking Status" : t}
              </option>
            ))}
          </select>

          <select className="input" value={respOrg} onChange={(e) => setRespOrg(e.target.value)}>
            {respOrgOptions.map((t) => (
              <option key={t} value={t}>
                {t === "All" ? "All Resp Org" : t}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="list">
        {filtered.map((w) => (
          <article key={w.id} className="card">
            <div className="row">
              <div style={{ minWidth: 240 }}>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{w.title}</div>

                <div className="rowLeft" style={{ marginTop: 8 }}>
                  {w.wtId ? <span className="badge">WT {w.wtId}</span> : null}
                  {w.facilityNumber ? <span className="badge">Fac {w.facilityNumber}</span> : null}
                  <span className="badge">{w.priority}</span>
                  <span className="badge">{w.status}</span>
                  {w.trackingStatus ? <span className="badge">{w.trackingStatus}</span> : null}
                </div>

                {(w.customerName || w.respOrg) && (
                  <div className="sub" style={{ marginTop: 8 }}>
                    {w.customerName ? <>Customer: <b>{w.customerName}</b></> : null}
                    {w.customerName && w.respOrg ? " • " : null}
                    {w.respOrg ? <>Resp Org: <b>{w.respOrg}</b></> : null}
                  </div>
                )}
              </div>

              <div className="rowLeft">
                <button className="btn btnBlue" onClick={() => patch(w.id, { status: "Open" })}>Open</button>
                <button className="btn btnAmber" onClick={() => patch(w.id, { status: "In Progress" })}>Start</button>
                <button className="btn btnGreen" onClick={() => patch(w.id, { status: "Done" })}>Done</button>

              </div>
            </div>

            <details style={{ marginTop: 12 }}>
              <summary style={{ cursor: "pointer", fontWeight: 900 }}>Details / Notes</summary>

              <div className="stack" style={{ marginTop: 12 }}>
                {w.description ? (
                  <div>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>Description</div>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{w.description}</div>
                  </div>
                ) : null}

                {w.resolutionDescription ? (
                  <div>
                    <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>WT Resolution Description</div>
                    <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{w.resolutionDescription}</div>
                  </div>
                ) : null}

                <div>
                  <div className="muted" style={{ fontSize: 12, fontWeight: 900 }}>Your Notes</div>
                  <textarea
                    className="input"
                    value={w.notes ?? ""}
                    onChange={(e) => patch(w.id, { notes: e.target.value })}
                    rows={3}
                    placeholder="Add your notes here…"
                    style={{ marginTop: 6 }}
                  />
                </div>
              </div>
            </details>
          </article>
        ))}
      </section>
    </main>
  );
}
