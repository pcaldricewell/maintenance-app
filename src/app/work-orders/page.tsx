"use client";

import { useMemo, useState } from "react";
import { storageKeys, useLocalStorageState } from "../../lib/useLocalStorageState";
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from "../../lib/types";
import { isoNow, uid } from "../../lib/types";

const card: React.CSSProperties = {
  background: "white",
  border: "1px solid #e6e6e6",
  borderRadius: 14,
  padding: 14,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid #ddd",
};

export default function WorkOrdersPage() {
  const [items, setItems] = useLocalStorageState<WorkOrder[]>(storageKeys.workOrders, []);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<WorkOrderPriority>("Medium");
  const [status, setStatus] = useState<WorkOrderStatus>("Open");
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items
      .filter((w) => (!query ? true : w.title.toLowerCase().includes(query)))
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  }, [items, q]);

  function addWorkOrder() {
    const t = title.trim();
    if (!t) return;
    const now = isoNow();
    const wo: WorkOrder = {
      id: uid(),
      title: t,
      status,
      priority,
      createdAt: now,
      updatedAt: now,
    };
    setItems([wo, ...items]);
    setTitle("");
    setPriority("Medium");
    setStatus("Open");
  }

  function setDone(id: string) {
    const now = isoNow();
    setItems(items.map((w) => (w.id === id ? { ...w, status: "Done", updatedAt: now } : w)));
  }

  function remove(id: string) {
    setItems(items.filter((w) => w.id !== id));
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={card}>
        <div style={{ fontWeight: 900, fontSize: 18 }}>Work Orders</div>
        <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
          <input
            style={input}
            placeholder="Title (e.g., Change oil in skid steer)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <select style={input} value={priority} onChange={(e) => setPriority(e.target.value as WorkOrderPriority)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <select style={input} value={status} onChange={(e) => setStatus(e.target.value as WorkOrderStatus)}>
              <option>Open</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>

          <button
            onClick={addWorkOrder}
            style={{
              padding: "12px 12px",
              borderRadius: 12,
              border: "none",
              fontWeight: 900,
              background: "#111",
              color: "white",
            }}
          >
            Add Work Order
          </button>
        </div>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ fontWeight: 900 }}>List</div>
          <input
            style={{ ...input, maxWidth: 220 }}
            placeholder="Search..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
          {filtered.length === 0 ? (
            <div style={{ opacity: 0.7 }}>No work orders yet.</div>
          ) : (
            filtered.map((w) => (
              <div key={w.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div>
                    <div style={{ fontWeight: 900 }}>{w.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.7 }}>
                      {w.status} • {w.priority}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {w.status !== "Done" && (
                      <button
                        onClick={() => setDone(w.id)}
                        style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 800 }}
                      >
                        Done
                      </button>
                    )}
                    <button
                      onClick={() => remove(w.id)}
                      style={{ padding: "8px 10px", borderRadius: 10, border: "1px solid #ddd", fontWeight: 800 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
