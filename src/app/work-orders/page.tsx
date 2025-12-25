:root{
  --bg: #f6f7f9;
  --card: #ffffff;
  --text: #0b0f19;
  --muted: #475569;
  --border: #e5e7eb;
  --shadow: 0 10px 26px rgba(15, 23, 42, .08);
}

body{
  background: var(--bg);
  color: var(--text);
}

.container{ max-width: 980px; margin: 0 auto; padding: 16px; }
.stack{ display: grid; gap: 12px; }
.row{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
.rowLeft{ display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.muted{ color: var(--muted); }

.card{
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 14px;
  box-shadow: var(--shadow);
}

.h1{ font-size: 22px; font-weight: 900; margin: 0; }
.sub{ font-size: 13px; color: var(--muted); margin-top: 6px; }

.input, select, textarea{
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  outline: none;
}
textarea{ resize: vertical; }

.btn{
  padding: 9px 12px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
  font-weight: 800;
  cursor: pointer;
}
.btn:hover{ filter: brightness(.98); }

.btnPrimary{
  background: #111;
  border-color: #111;
  color: #fff;
}

.badge{
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: #fff;
  font-size: 12px;
  font-weight: 800;
}

.grid2{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.list{ display: grid; gap: 10px; }
