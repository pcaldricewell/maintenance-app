export default function Home() {
  return (
    <main style={{ padding: 16, fontFamily: "system-ui" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontWeight: 950, fontSize: 16 }}>Maintenance App (until I get computer access)</div>

          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>Quick actions + overview</p>
        </div>
        <span
          style={{
            fontSize: 12,
            padding: "6px 10px",
            border: "1px solid #ddd",
            borderRadius: 999,
          }}
        >
          Live ✅
        </span>
      </header>

      <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
        <a href="/work-orders" style={cardStyle}>
          <div style={cardTitle}>Work Orders</div>
          <div style={cardText}>Create / track jobs and status</div>
        </a>

        <a href="/equipment" style={cardStyle}>
          <div style={cardTitle}>Equipment</div>
          <div style={cardText}>Assets, service intervals, notes</div>
        </a>

        <a href="/vendors" style={cardStyle}>
          <div style={cardTitle}>Vendors</div>
          <div style={cardText}>Contacts + parts sources</div>
        </a>

        <a href="/settings" style={cardStyle}>
          <div style={cardTitle}>Settings</div>
          <div style={cardText}>Company info, defaults, export</div>
        </a>
      </section>

      <section style={{ marginTop: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>Next steps</h2>
        <ol style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
          <li>Create pages for Work Orders / Equipment</li>
          <li>Add a simple data store (JSON, Supabase, or Postgres)</li>
          <li>Deploy to Vercel so it works on mobile data</li>
        </ol>
      </section>
    </main>
  );
}

const cardStyle: React.CSSProperties = {
  display: "block",
  padding: 14,
  border: "1px solid #e5e5e5",
  borderRadius: 14,
  textDecoration: "none",
  color: "inherit",
};

const cardTitle: React.CSSProperties = { fontSize: 16, fontWeight: 800 };
const cardText: React.CSSProperties = { marginTop: 4, opacity: 0.75 };
