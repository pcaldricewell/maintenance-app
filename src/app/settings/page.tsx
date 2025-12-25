"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { storageKeys, useLocalStorageState } from "../../lib/useLocalStorageState";
import type { Priority, WorkOrder } from "../../lib/types";

function normalizeKey(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function mapPriority(raw: unknown): Priority {
  const s = String(raw ?? "").toLowerCase();
  if (s.startsWith("4a") || s.startsWith("3a") || s.includes("high")) return "High";
  if (s.startsWith("3b") || s.includes("medium")) return "Medium";
  return "Low";
}

function mapStatusFromTracking(tracking: unknown): WorkOrder["status"] {
  const s = String(tracking ?? "").toLowerCase();
  if (s.includes("progress") || s.includes("materiel complete") || s.includes("material complete")) return "In Progress";
  if (s.includes("await") || s.includes("sched")) return "Open";
  return "Open";
}

function toISODate(v: any, XLSX: any): string | null {
  if (!v) return null;
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);

  if (typeof v === "number" && XLSX?.SSF?.parse_date_code) {
    const d = XLSX.SSF.parse_date_code(v);
    if (d?.y && d?.m && d?.d) {
      const dt = new Date(Date.UTC(d.y, d.m - 1, d.d));
      return dt.toISOString().slice(0, 10);
    }
  }

  if (typeof v === "string") {
    const dt = new Date(v);
    if (!Number.isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
  }
  return null;
}

function safeStr(v: any): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!s || s.toLowerCase() === "nan") return null;
  return s;
}

export default function SettingsPage() {
  const [workOrders, setWorkOrders] = useLocalStorageState<WorkOrder[]>(storageKeys.workOrders, []);

  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<WorkOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const existingByWtId = useMemo(() => {
    const m = new Map<string, WorkOrder>();
    for (const w of workOrders) m.set(String(w.wtId ?? w.id), w);
    return m;
  }, [workOrders]);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    setPreview(null);

    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array", cellDates: true });

      const now = new Date().toISOString();
      const allRows: Record<string, any>[] = [];

      // Import ALL sheets so your file structure can change over time
      for (const sheetName of wb.SheetNames) {
        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: "" }) as Record<string, any>[];
        allRows.push(...rows);
      }

      const parsed: WorkOrder[] = allRows
        .map((row) => {
          // normalize headers
          const norm: Record<string, any> = {};
          for (const [k, v] of Object.entries(row)) norm[normalizeKey(k)] = v;

          const wtId = safeStr(norm["wtid"]);
          const taskName = safeStr(norm["taskname"]);
          const description = safeStr(norm["description"]);

          // Skip empty lines
          if (!wtId && !taskName && !description) return null;

          const title =
            taskName ||
            (description ? description.slice(0, 90) : null) ||
            (wtId ? `WT ${wtId}` : "Work Order");

          const trackingStatus = safeStr(norm["trackingstatus"]);
          const wtPriorityRaw = safeStr(norm["wtpriority"]);

          const wo: WorkOrder = {
            id: wtId || `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`,
            title,
            status: mapStatusFromTracking(trackingStatus),
            priority: mapPriority(wtPriorityRaw),
            notes: "",

            wtId: wtId || undefined,
            createdDate: toISODate(norm["createddate"], XLSX),
            laborStartDate: toISODate(norm["laborstartdate"], XLSX),
            wtPriorityRaw: wtPriorityRaw,

            facilityNumber: safeStr(norm["facilitynumber"]),
            taskName,
            description,
            resolutionDescription: safeStr(norm["wtresolutiondescription"]),

            trackingStatus,
            wtStatus: safeStr(norm["wtstatus"]),
            customerName: safeStr(norm["customername"]),
            respOrg: safeStr(norm["resporg"]),
            responsiblePerson: safeStr(norm["responsibleperson"]),

            createdAt: now,
            updatedAt: now,
          };

          return wo;
        })
        .filter(Boolean) as WorkOrder[];

      // sanity check: must have WT-ID somewhere
      if (!parsed.some((w) => w.wtId)) {
        throw new Error("Import failed: couldn’t find a WT-ID column. Make sure header is 'WT-ID'.");
      }

      setPreview(parsed);
    } catch (e: any) {
      setError(e?.message ?? "Import failed.");
    } finally {
      setBusy(false);
    }
  }

  function replaceData() {
    if (!preview) return;
    setWorkOrders(preview);
    setPreview(null);
  }

  function mergeDataKeepNotesStatus() {
    if (!preview) return;

    const merged = preview.map((incoming) => {
      const key = String(incoming.wtId ?? incoming.id);
      const existing = existingByWtId.get(key);
      if (!existing) return incoming;

      // keep your manual fields
      return {
        ...incoming,
        id: existing.id,
        notes: existing.notes ?? "",
        status: existing.status ?? incoming.status,
        updatedAt: new Date().toISOString(),
      };
    });

    setWorkOrders(merged);
    setPreview(null);
  }

  function clearAll() {
    window.localStorage.removeItem(storageKeys.workOrders);
    setWorkOrders([]);
    setPreview(null);
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 22, fontWeight: 900 }}>Settings</h1>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Upload your Excel anytime to update Work Orders.
      </p>

      <div style={{ marginTop: 14, padding: 14, border: "1px solid #e6e6e6", borderRadius: 14, background: "white" }}>
        <div style={{ fontWeight: 900 }}>Import Work Orders (Excel)</div>
        <div style={{ fontSize: 12, opacity: 0.75, marginTop: 6 }}>
          Uses headers like: WT-ID, Created Date, WT Priority, Facility Number, Task Name, Description, WT Resolution Description,
          Tracking Status, WT Status, Customer Name, Resp Org, Labor Start Date (Responsible Person optional)
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
              e.currentTarget.value = "";
            }}
          />
        </div>

        {busy && <div style={{ marginTop: 10 }}>Reading file…</div>}
        {error && <div style={{ marginTop: 10, color: "crimson" }}>{error}</div>}

        {preview && (
          <div style={{ marginTop: 12, padding: 12, borderRadius: 12, background: "#f6f6f6" }}>
            <div>
              Found <b>{preview.length}</b> rows.
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <button onClick={replaceData} style={btnPrimary}>Replace data</button>
              <button onClick={mergeDataKeepNotesStatus} style={btn}>Merge (keep notes/status)</button>
              <button onClick={() => setPreview(null)} style={btn}>Cancel</button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.75, marginTop: 8 }}>
              Example: {preview[0]?.wtId ? `WT ${preview[0].wtId}` : ""}{preview[0]?.facilityNumber ? ` • Fac ${preview[0].facilityNumber}` : ""}{preview[0]?.trackingStatus ? ` • ${preview[0].trackingStatus}` : ""}
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 14, padding: 14, border: "1px solid #e6e6e6", borderRadius: 14, background: "white" }}>
        <div style={{ fontWeight: 900 }}>Local data</div>
        <div style={{ marginTop: 6, opacity: 0.75 }}>Work Orders on this device: <b>{workOrders.length}</b></div>

        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          <button onClick={clearAll} style={btn}>Clear Work Orders (this device)</button>
          <Link href="/work-orders" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>View Work Orders</Link>
          <Link href="/" style={{ ...btn, textDecoration: "none", display: "inline-block" }}>← Home</Link>
        </div>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
  background: "white",
  fontWeight: 800,
};

const btnPrimary: React.CSSProperties = {
  ...btn,
  background: "#111",
  color: "white",
  border: "1px solid #111",
};
