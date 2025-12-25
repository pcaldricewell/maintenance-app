"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLocalStorageState } from "../../lib/useLocalStorageState";

type Vendor = {
  id: string;
  name: string;
  category?: string;
  phone?: string;
  email?: string;
  website?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

function uid() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`
  );
}

const vendorKey = "maint.vendors";

export default function VendorsPage() {
  const [vendors, setVendors] = useLocalStorageState<Vendor[]>(vendorKey, []);

  const [q, setQ] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return vendors
      .filter((v) => {
        if (!query) return true;
        const blob = [v.name, v.category, v.phone, v.email, v.website, v.notes]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return blob.includes(query);
      })
      .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
  }, [vendors, q]);

  function addVendor() {
    const n = name.trim();
    if (!n) return;
    const now = new Date().toISOString();
    const v: Vendor = {
      id: uid(),
      name: n,
      category: category.trim() || undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      website: website.trim() || undefined,
      notes: notes.trim() || undefined,
      createdAt: now,
      updatedAt: now,
    };
    setVendors([v, ...vendors]);
    setName(""); setCategory(""); setPhone(""); setEmail(""); setWebsite(""); setNotes("");
  }

  function remove(id: string) {
    setVendors(vendors.filter((v) => v.id !== id));
  }

  return (
    <main className="container stack">
      <header className="row">
        <div>
          <h1 className="h1">Vendors</h1>
          <div className="sub">Tap to call/email. Saved on this device.</div>
        </div>
        <div className="rowLeft">
          <Link href="/" className="btn">← Home</Link>
        </div>
      </header>

      <section className="card stack">
        <div className="row">
          <div style={{ fontWeight: 950 }}>Add Vendor</div>
          <button className="btn btnPrimary" onClick={addVendor}>+ Add</button>
        </div>

        <div className="grid2">
          <input className="input" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="input" placeholder="Category (Parts, HVAC, Plumbing...)" value={category} onChange={(e) => setCategory(e.target.value)} />
          <input className="input" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <input className="input" placeholder="Website (https://...)" value={website} onChange={(e) => setWebsite(e.target.value)} />
        <textarea className="input" rows={3} placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      </section>

      <section className="card stack toolbar">
        <div className="row">
          <div style={{ fontWeight: 950 }}>Search</div>
          <input className="input" style={{ maxWidth: 520 }} placeholder="Search vendors…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </section>

      <section className="list">
        {filtered.length === 0 ? (
          <div className="card muted">No vendors yet.</div>
        ) : (
          filtered.map((v) => (
            <article key={v.id} className="card">
              <div className="row">
                <div style={{ minWidth: 240 }}>
                  <div style={{ fontWeight: 950 }}>{v.name}</div>
                  <div className="sub">
                    {v.category ? <span className="badge">{v.category}</span> : null}
                  </div>
                </div>

                <div className="rowLeft">
                  {v.phone ? (
                    <a className="btn btnBlue" href={`tel:${v.phone}`}>(Call) {v.phone}</a>
                  ) : null}
                  {v.email ? (
                    <a className="btn btnAmber" href={`mailto:${v.email}`}>Email</a>
                  ) : null}
                  {v.website ? (
                    <a className="btn btnGreen" href={v.website.startsWith("http") ? v.website : `https://${v.website}`} target="_blank" rel="noreferrer">
                      Website
                    </a>
                  ) : null}
                  <button className="btn" onClick={() => remove(v.id)}>Delete</button>
                </div>
              </div>

              {v.notes ? (
                <div className="muted" style={{ marginTop: 10, whiteSpace: "pre-wrap" }}>{v.notes}</div>
              ) : null}
            </article>
          ))
        )}
      </section>
    </main>
  );
}
