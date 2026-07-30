import React, { useState, useMemo, useEffect } from "react";
import {
  Menu, X, LayoutDashboard, Trophy, Users, Newspaper, BarChart3,
  CalendarCheck, MessageSquareWarning, ShieldCheck, Plus, Pencil,
  Trash2, Check, EyeOff, Star, ArrowUpCircle, ArrowDownCircle,
  AlertTriangle, ChevronDown
} from "lucide-react";
import { useAuth, ADMIN_EMAIL } from "./AuthProvider";

const API = "http://localhost:3000";
const FONT_LINK_ID = "titans-admin-fonts";

const MATCH_FIELDS = [
  { key: "opponent", label: "Opponent", type: "text" },
  { key: "competition", label: "Competition", type: "select", options: ["BPL", "Federation Cup", "Friendly"] },
  { key: "date", label: "Date", type: "date" },
  { key: "time", label: "Kickoff time", type: "time" },
  { key: "venue", label: "Venue", type: "text" },
  { key: "home", label: "Home fixture", type: "checkbox" },
  { key: "status", label: "Status", type: "select", options: ["upcoming", "live", "completed"] },
  { key: "homeScore", label: "Home score", type: "number" },
  { key: "awayScore", label: "Away score", type: "number" }
];

const PLAYER_FIELDS = [
  { key: "name", label: "Full name", type: "text" },
  { key: "position", label: "Position", type: "select", options: ["Goalkeeper", "Defender", "Midfielder", "Forward"] },
  { key: "number", label: "Jersey number", type: "number" },
  { key: "dob", label: "Date of birth", type: "date" },
  { key: "status", label: "Status", type: "select", options: ["Active", "Injured", "On loan"] },
  { key: "bio", label: "Short bio", type: "textarea" }
];

const NEWS_FIELDS = [
  { key: "title", label: "Headline", type: "text" },
  { key: "tag", label: "Category", type: "select", options: ["Match report", "Transfer", "Club news", "Community"] },
  { key: "date", label: "Publish date", type: "date" },
  { key: "excerpt", label: "Excerpt", type: "textarea" },
  { key: "body", label: "Full article", type: "textarea" }
];

let pollUid = 100;
const nextPollId = () => `poll${pollUid++}`;

function formatFullDate(value) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function useGoogleFonts() {
  React.useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);
}

const BADGE_TONES = {
  slate: "bg-white/10 text-[#f4f1e6]",
  gold: "bg-[#e0a52e]/15 text-[#f0c968]",
  emerald: "bg-[#37b872]/15 text-[#7fe0ab]",
  crimson: "bg-[#d1374c]/15 text-[#f4a3af]",
};

const Badge = ({ children, tone = "slate" }) => (
  <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${BADGE_TONES[tone] || BADGE_TONES.slate}`}>
    {children}
  </span>
);

const IconBtn = ({ onClick, children, danger, label }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`w-[30px] h-[30px] shrink-0 flex items-center justify-center rounded-md border transition-colors ${
      danger
        ? "border-[#d1374c]/40 text-[#d1374c] hover:bg-[#d1374c]/10"
        : "border-[#e0a52e]/25 text-[#f4f1e6] hover:bg-[#e0a52e]/10"
    }`}
  >
    {children}
  </button>
);

const StatBadge = ({ value, label }) => (
  <div>
    <div className="bg-[#0b0c0a] text-[#e0a52e] font-['Poppins',sans-serif] font-bold text-xl sm:text-2xl px-3.5 py-2.5 sm:px-4.5 sm:py-3 rounded min-w-[62px] sm:min-w-[70px] text-center">
      {value}
    </div>
    <div className="font-['Poppins',sans-serif] font-semibold text-[10px] sm:text-[11px] tracking-[0.05em] text-[#4d7e69] uppercase mt-1.5">{label}</div>
  </div>
);

const SectionHead = ({ eyebrow, title, action }) => (
  <div className="flex items-end justify-between gap-3.5 flex-wrap">
    <div>
      <span className="font-['Poppins',sans-serif] text-[11px] sm:text-[12px] font-bold tracking-[0.08em] text-[#e0a52e]">{eyebrow}</span>
      <h2 className="font-['Poppins',sans-serif] font-extrabold uppercase text-xl sm:text-2xl leading-tight mt-1 mb-1 text-[#f4f1e6] tracking-tight">{title}</h2>
    </div>
    {action && <div className="w-full sm:w-auto">{action}</div>}
  </div>
);

const Stars = ({ value, size = 14 }) => (
  <div className="flex gap-0.5 mt-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star key={s} size={size} fill={s <= value ? "#e0a52e" : "none"} stroke={s <= value ? "#e0a52e" : "#4d7e69"} strokeWidth={1.75} />
    ))}
  </div>
);

const primaryBtn = "inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md text-[13.5px] font-bold bg-[#d1374c] text-[#f4f1e6] hover:bg-[#b82c40] transition-colors w-full sm:w-auto";
const ghostBtn = "px-3.5 py-2 rounded-md text-[13.5px] font-bold border border-[#e0a52e]/25 text-[#f4f1e6] hover:bg-[#e0a52e]/10 transition-colors";
const dangerBtn = "px-3.5 py-2 rounded-md text-[13.5px] font-bold bg-[#d1374c] text-[#f4f1e6] hover:bg-[#b82c40] transition-colors";
const inputCls = "bg-[#0e2b21] border border-[#e0a52e]/20 rounded-md px-3 py-2 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:ring-2 focus:ring-[#e0a52e]/15 w-full [color-scheme:dark]";
const linkCls = "bg-transparent border-none text-[#f0c968] text-[13px] font-bold inline-flex items-center gap-1 hover:text-[#e0a52e]";

function RecordModal({ title, fields, initialData, onSave, onClose }) {
  const [form, setForm] = useState(() => {
    const base = {};
    fields.forEach((f) => { base[f.key] = initialData?.[f.key] ?? (f.type === "checkbox" ? false : ""); });
    return base;
  });
  const [saving, setSaving] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-[#143a2c] border border-[#e0a52e]/25 rounded-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-4.5 sm:py-4 border-b border-[#e0a52e]/15">
          <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase text-base sm:text-lg text-[#f4f1e6] tracking-tight">{title}</h3>
          <IconBtn label="Close" onClick={onClose}><X size={18} /></IconBtn>
        </div>
        <div className="px-4 py-3.5 sm:px-4.5 sm:py-4 overflow-y-auto">
          {fields.map((f) => (
            <div key={f.key} className={f.type === "checkbox" ? "flex items-center gap-2 mb-3.5" : "flex flex-col gap-1.5 mb-3.5"}>
              {f.type !== "checkbox" && <label className="text-[12.5px] font-bold text-[#f0c968]">{f.label}</label>}

              {f.type === "textarea" && (
                <textarea className={`${inputCls} resize-y`} rows={3} value={form[f.key]} onChange={(e) => update(f.key, e.target.value)} />
              )}

              {f.type === "select" && (
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-8`} value={form[f.key]} onChange={(e) => update(f.key, e.target.value)}>
                    <option value="" disabled>Select {f.label.toLowerCase()}</option>
                    {f.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#e0a52e] pointer-events-none" />
                </div>
              )}

              {f.type === "checkbox" && (
                <>
                  <input
                    type="checkbox"
                    checked={!!form[f.key]}
                    onChange={(e) => update(f.key, e.target.checked)}
                    className="h-4 w-4 accent-[#e0a52e]"
                  />
                  <label className="text-[12.5px] font-bold text-[#f0c968]">{f.label}</label>
                </>
              )}

              {["text", "number", "date", "time"].includes(f.type) && (
                <input className={inputCls} type={f.type} value={form[f.key]} onChange={(e) => update(f.key, e.target.value)} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2.5 px-4 py-3 sm:px-4.5 sm:py-3.5 border-t border-[#e0a52e]/15">
          <button className={ghostBtn} onClick={onClose}>Cancel</button>
          <button className={dangerBtn} disabled={saving} onClick={submit}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel = "Confirm", danger, onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  const run = async () => {
    setBusy(true);
    await onConfirm();
    setBusy(false);
  };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={onCancel}>
      <div className="w-full max-w-sm bg-[#143a2c] border border-[#e0a52e]/25 rounded-xl p-4 sm:p-5" onClick={(e) => e.stopPropagation()}>
        <div className="w-[34px] h-[34px] rounded-full bg-[#e0a52e]/15 text-[#e0a52e] flex items-center justify-center mb-2.5">
          <AlertTriangle size={18} />
        </div>
        <h3 className="font-bold text-[15.5px] text-[#f4f1e6] mb-1.5">{title}</h3>
        <p className="text-[13.5px] text-[#f4f1e6]/75">{message}</p>
        <div className="flex justify-end gap-2.5 mt-5">
          <button className={ghostBtn} onClick={onCancel}>Cancel</button>
          <button className={danger ? dangerBtn : primaryBtn} disabled={busy} onClick={run}>
            {busy ? "Working..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}



const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "matches", label: "Matches", Icon: Trophy },
  { id: "players", label: "Players", Icon: Users },
  { id: "news", label: "News", Icon: Newspaper },
  { id: "polls", label: "Polls", Icon: BarChart3 },
  { id: "bookings", label: "Bookings & RSVPs", Icon: CalendarCheck },
  { id: "reviews", label: "Fan Reviews", Icon: MessageSquareWarning },
  { id: "users", label: "Users & Roles", Icon: ShieldCheck }
];

function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {open && <div className="md:hidden fixed inset-0 bg-black/50 z-30" onClick={onClose} />}
      <aside
        className={`w-[250px] shrink-0 bg-[#0a2118] border-r border-[#e0a52e]/[0.14] flex flex-col fixed md:sticky top-0 h-screen z-40
          transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
          w-[82%] xs:w-[78%] max-w-[270px] md:w-[250px] lg:w-[260px] md:max-w-none shadow-[20px_0_40px_rgba(0,0,0,0.4)] md:shadow-none`}
      >
        <div className="flex items-center gap-2.5 px-4 py-4 sm:py-5 border-b border-[#e0a52e]/[0.14]">
          <div
            className="w-9 h-10 bg-[#0b0c0a] border-[1.5px] border-[#e0a52e] flex items-center justify-center font-['Poppins',sans-serif] font-extrabold text-[#e0a52e] text-[13px] shrink-0"
            style={{ clipPath: "polygon(50% 0%, 100% 18%, 100% 70%, 50% 100%, 0% 70%, 0% 18%)" }}
          >
            CT
          </div>
          <div className="leading-tight flex-1 min-w-0">
            <div className="font-['Poppins',sans-serif] font-bold text-[13px] sm:text-[14px] tracking-wide text-[#f4f1e6] truncate">CHATTOGRAM TITANS</div>
            <div className="font-['Poppins',sans-serif] font-semibold text-[10px] text-[#e0a52e] tracking-[0.08em]">ADMIN CONSOLE</div>
          </div>
          <button className="md:hidden ml-auto" onClick={onClose} aria-label="Close menu">
            <X size={20} className="text-[#f4f1e6]" />
          </button>
        </div>
        <nav className="flex flex-col px-2.5 py-3 gap-0.5 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`flex items-center gap-2.5 px-2.5 py-2.5 rounded-md text-[13.5px] sm:text-[14px] font-medium text-left transition-colors ${
                active === id
                  ? "bg-[#e0a52e]/[0.14] text-[#f0c968] shadow-[inset_3px_0_0_#e0a52e]"
                  : "text-[#f4f1e6]/[0.72] hover:bg-[#e0a52e]/[0.08] hover:text-[#f4f1e6]"
              }`}
            >
              <Icon size={17} strokeWidth={2} className="shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-1.5 px-4 py-3.5 border-t border-[#e0a52e]/[0.14] font-['Poppins',sans-serif] font-medium text-[10.5px] tracking-[0.04em] text-[#4d7e69]">
          <ShieldCheck size={15} className="shrink-0" />
          <span>SINCE 1998 &middot; TITANS ARENA</span>
        </div>
      </aside>
    </>
  );
}

function OverviewTab({ matches, players, news, bookings, reviews, users }) {
  const nextMatch = matches.find((m) => m.status === "upcoming");
  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <div className="flex gap-4 sm:gap-7 flex-wrap">
        <StatBadge value={String(matches.filter((m) => m.status === "upcoming").length).padStart(2, "0")} label="Upcoming Matches" />
        <StatBadge value={String(players.length).padStart(2, "0")} label="Squad Players" />
        <StatBadge value={String(news.length).padStart(2, "0")} label="News Posts" />
        <StatBadge value={String(bookings.length).padStart(2, "0")} label="RSVPs Received" />
        <StatBadge value={String(pending).padStart(2, "0")} label="Pending Reviews" />
        <StatBadge value={String(users.length).padStart(2, "0")} label="Registered Fans" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl px-4 py-4 sm:px-5 sm:py-4.5">
          <span className="font-['Poppins',sans-serif] text-[11px] sm:text-[12px] font-bold tracking-[0.08em] text-[#e0a52e]">NEXT FIXTURE</span>
          {nextMatch ? (
            <>
              <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase text-xl sm:text-2xl mt-1 mb-2 text-[#f4f1e6] tracking-tight break-words">
                TITANS VS {nextMatch.opponent?.toUpperCase()}
              </h3>
              <p className="text-[13.5px] text-[#4d7e69] m-0">{nextMatch.date} &middot; {nextMatch.time} &middot; {nextMatch.venue}</p>
              <p className="text-[13.5px] text-[#4d7e69] m-0">{nextMatch.competition}</p>
            </>
          ) : (
            <p className="text-[13.5px] text-[#4d7e69] mt-2">No upcoming fixtures scheduled.</p>
          )}
        </section>
        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl px-4 py-4 sm:px-5 sm:py-4.5">
          <span className="font-['Poppins',sans-serif] text-[11px] sm:text-[12px] font-bold tracking-[0.08em] text-[#e0a52e]">NEEDS YOUR ATTENTION</span>
          <ul className="list-none m-0 mt-2 p-0 flex flex-col gap-2 text-[13.5px] text-[#f4f1e6]">
            {pending > 0 && <li className="flex items-center gap-2"><MessageSquareWarning size={15} className="shrink-0" /> {pending} review{pending > 1 ? "s" : ""} awaiting moderation</li>}
            {bookings.length > 0 && <li className="flex items-center gap-2"><CalendarCheck size={15} className="shrink-0" /> {bookings.length} RSVP{bookings.length > 1 ? "s" : ""} logged for fixtures</li>}
            {pending === 0 && bookings.length === 0 && <li className="text-[#4d7e69]">You're all caught up.</li>}
          </ul>
        </section>
      </div>
    </div>
  );
}

function MatchesTab({ matches, setMatches }) {
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const statusTone = { upcoming: "gold", live: "emerald", completed: "slate" };

  const handleSave = async (form) => {
    try {
      if (modal.mode === "create") {
        const res = await fetch(`${API}/matches`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.insertedId) {
          setMatches((list) => [{ _id: data.insertedId, ...form }, ...list]);
        }
      } else {
        const res = await fetch(`${API}/matches/${modal.record._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.modifiedCount || data.upsertedCount) {
          setMatches((list) => list.map((m) => (m._id === modal.record._id ? { ...m, ...form } : m)));
        }
      }
    } catch (err) {
      console.error("Failed to save match:", err);
    }
  };

  const handleDelete = async () => {
    const target = toDelete;
    try {
      const res = await fetch(`${API}/matches/${target._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.deletedCount) {
        setMatches((list) => list.filter((m) => m._id !== target._id));
      }
    } catch (err) {
      console.error("Failed to delete match:", err);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead
        eyebrow="FIXTURES"
        title="MATCHES"
        action={<button className={primaryBtn} onClick={() => setModal({ mode: "create" })}><Plus size={15} /> New match</button>}
      />
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl">
        <table className="w-full min-w-[640px] sm:min-w-0 border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Fixture", "Competition", "Date", "Venue", "Status", "Score", ""].map((h) => (
                <th key={h} className="text-left font-['Poppins',sans-serif] font-semibold text-[11px] tracking-[0.04em] text-[#4d7e69] uppercase px-3.5 py-3 border-b border-[#e0a52e]/[0.14] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matches.map((m) => (
              <tr key={m._id}>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] font-bold whitespace-nowrap text-[#f4f1e6]">
                  {m.home ? `Titans vs ${m.opponent}` : `${m.opponent} vs Titans`}
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{m.competition}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{m.date} &middot; {m.time}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{m.venue}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap"><Badge tone={statusTone[m.status]}>{m.status}</Badge></td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">
                  {m.status === "completed" ? `${m.homeScore || "-"} \u2013 ${m.awayScore || "-"}` : "\u2014"}
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap">
                  <div className="flex gap-1.5">
                    <IconBtn label="Edit" onClick={() => setModal({ mode: "edit", record: m })}><Pencil size={14} /></IconBtn>
                    <IconBtn label="Delete" danger onClick={() => setToDelete(m)}><Trash2 size={14} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {matches.length === 0 && (
              <tr><td colSpan={7} className="text-center text-[#4d7e69] py-6">No matches yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <RecordModal
          title={modal.mode === "create" ? "Add match" : "Edit match"}
          fields={MATCH_FIELDS}
          initialData={modal.record}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete this match?"
          message={`Titans vs ${toDelete.opponent} on ${toDelete.date} will be permanently removed.`}
          confirmLabel="Delete" danger
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function PlayersTab({ players, setPlayers }) {
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const statusTone = { Active: "emerald", Injured: "crimson", "On loan": "gold" };

  const handleSave = async (form) => {
    try {
      if (modal.mode === "create") {
        const res = await fetch(`${API}/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.insertedId) {
          setPlayers((list) => [{ _id: data.insertedId, ...form }, ...list]);
        }
      } else {
        const res = await fetch(`${API}/players/${modal.record._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.modifiedCount || data.upsertedCount) {
          setPlayers((list) => list.map((p) => (p._id === modal.record._id ? { ...p, ...form } : p)));
        }
      }
    } catch (err) {
      console.error("Failed to save player:", err);
    }
  };

  const handleDelete = async () => {
    const target = toDelete;
    try {
      const res = await fetch(`${API}/players/${target._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.deletedCount) {
        setPlayers((list) => list.filter((p) => p._id !== target._id));
      }
    } catch (err) {
      console.error("Failed to delete player:", err);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead
        eyebrow="SQUAD"
        title="PLAYERS"
        action={<button className={primaryBtn} onClick={() => setModal({ mode: "create" })}><Plus size={15} /> New player</button>}
      />
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl">
        <table className="w-full min-w-[560px] sm:min-w-0 border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["#", "Name", "Position", "DOB", "Status", ""].map((h) => (
                <th key={h} className="text-left font-['Poppins',sans-serif] font-semibold text-[11px] tracking-[0.04em] text-[#4d7e69] uppercase px-3.5 py-3 border-b border-[#e0a52e]/[0.14] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p._id}>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] font-['Poppins',sans-serif] font-bold text-[#e0a52e] whitespace-nowrap">{p.number}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] font-bold whitespace-nowrap text-[#f4f1e6]">{p.name}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{p.position}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{p.dob}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap"><Badge tone={statusTone[p.status] || "slate"}>{p.status}</Badge></td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap">
                  <div className="flex gap-1.5">
                    <IconBtn label="Edit" onClick={() => setModal({ mode: "edit", record: p })}><Pencil size={14} /></IconBtn>
                    <IconBtn label="Delete" danger onClick={() => setToDelete(p)}><Trash2 size={14} /></IconBtn>
                  </div>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr><td colSpan={6} className="text-center text-[#4d7e69] py-6">No players yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <RecordModal
          title={modal.mode === "create" ? "Add player" : "Edit player"}
          fields={PLAYER_FIELDS}
          initialData={modal.record}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Remove this player?"
          message={`${toDelete.name} will be removed from the squad list.`}
          confirmLabel="Delete" danger
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function NewsTab({ news, setNews }) {
  const [modal, setModal] = useState(null);
  const [toDelete, setToDelete] = useState(null);

  const handleSave = async (form) => {
    try {
      if (modal.mode === "create") {
        const res = await fetch(`${API}/news`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.insertedId) {
          setNews((list) => [{ _id: data.insertedId, ...form }, ...list]);
        }
      } else {
        const res = await fetch(`${API}/news/${modal.record._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (data.modifiedCount || data.upsertedCount) {
          setNews((list) => list.map((n) => (n._id === modal.record._id ? { ...n, ...form } : n)));
        }
      }
    } catch (err) {
      console.error("Failed to save news post:", err);
    }
  };

  const handleDelete = async () => {
    const target = toDelete;
    try {
      const res = await fetch(`${API}/news/${target._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.deletedCount) {
        setNews((list) => list.filter((n) => n._id !== target._id));
      }
    } catch (err) {
      console.error("Failed to delete news post:", err);
    } finally {
      setToDelete(null);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead
        eyebrow="CONTENT"
        title="NEWS POSTS"
        action={<button className={primaryBtn} onClick={() => setModal({ mode: "create" })}><Plus size={15} /> New post</button>}
      />
      <div className="flex flex-col gap-3">
        {news.map((n) => (
          <div key={n._id} className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl px-4 py-4 sm:px-5 sm:py-4.5 flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <Badge tone="gold">{n.tag}</Badge>
                <span className="text-[12.5px] text-[#4d7e69]">{n.date}</span>
              </div>
              <h4 className="font-bold text-[15px] text-[#f4f1e6] mb-1">{n.title}</h4>
              <p className="text-[13.5px] text-[#4d7e69] m-0">{n.excerpt}</p>
            </div>
            <div className="flex gap-1.5 self-end sm:self-start shrink-0">
              <IconBtn label="Edit" onClick={() => setModal({ mode: "edit", record: n })}><Pencil size={14} /></IconBtn>
              <IconBtn label="Delete" danger onClick={() => setToDelete(n)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
        {news.length === 0 && <p className="text-[13.5px] text-[#4d7e69]">No news posts yet.</p>}
      </div>

      {modal && (
        <RecordModal
          title={modal.mode === "create" ? "Add news post" : "Edit news post"}
          fields={NEWS_FIELDS}
          initialData={modal.record}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {toDelete && (
        <ConfirmDialog
          title="Delete this post?"
          message={`"${toDelete.title}" will be permanently removed.`}
          confirmLabel="Delete" danger
          onCancel={() => setToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}

function PollsTab({ polls, setPolls }) {
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [toDelete, setToDelete] = useState(null);

  const submit = () => {
    const clean = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || clean.length < 2) return;
    setPolls((list) => [
      { id: nextPollId(), question: question.trim(), status: "open", options: clean.map((label) => ({ id: nextPollId(), label, votes: 0 })) },
      ...list
    ]);
    setQuestion(""); setOptions(["", ""]); setCreating(false);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead
        eyebrow="FAN ENGAGEMENT"
        title="POLLS"
        action={<button className={primaryBtn} onClick={() => setCreating(true)}><Plus size={15} /> New poll</button>}
      />
      <div className="flex flex-col gap-3">
        {polls.map((p) => {
          const total = p.options.reduce((s, o) => s + o.votes, 0) || 1;
          return (
            <div key={p.id} className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl px-4 py-4 sm:px-5 sm:py-4.5">
              <div className="flex items-start justify-between gap-3.5 mb-2.5 flex-wrap">
                <div>
                  <Badge tone={p.status === "open" ? "emerald" : "slate"}>{p.status}</Badge>
                  <h4 className="font-bold text-[15px] text-[#f4f1e6] mt-1.5 mb-1">{p.question}</h4>
                </div>
                <div className="flex gap-1.5">
                  <IconBtn
                    label={p.status === "open" ? "Close poll" : "Reopen poll"}
                    onClick={() => setPolls((list) => list.map((x) => (x.id === p.id ? { ...x, status: x.status === "open" ? "closed" : "open" } : x)))}
                  >
                    {p.status === "open" ? <EyeOff size={14} /> : <Check size={14} />}
                  </IconBtn>
                  <IconBtn label="Delete" danger onClick={() => setToDelete(p)}><Trash2 size={14} /></IconBtn>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {p.options.map((o) => (
                  <div key={o.id}>
                    <div className="flex justify-between text-[12.5px] text-[#f4f1e6]/80"><span>{o.label}</span><span>{o.votes} votes</span></div>
                    <div className="h-1.5 bg-[#0e2b21] rounded mt-1 overflow-hidden">
                      <div className="h-full bg-[#e0a52e]" style={{ width: `${Math.round((o.votes / total) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {polls.length === 0 && <p className="text-[13.5px] text-[#4d7e69]">No polls yet.</p>}
      </div>

      {creating && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setCreating(false)}>
          <div className="w-full max-w-md bg-[#143a2c] border border-[#e0a52e]/25 rounded-xl max-h-[92vh] sm:max-h-[88vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-4.5 sm:py-4 border-b border-[#e0a52e]/[0.14]">
              <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase text-base sm:text-lg text-[#f4f1e6] tracking-tight">NEW POLL</h3>
              <IconBtn label="Close" onClick={() => setCreating(false)}><X size={18} /></IconBtn>
            </div>
            <div className="px-4 py-3.5 sm:px-4.5 sm:py-4 overflow-y-auto">
              <div className="flex flex-col gap-1.5 mb-3.5">
                <label className="text-[12.5px] font-bold text-[#f0c968]">Question</label>
                <input className={inputCls} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="e.g. Man of the match vs Sylhet Rangers?" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12.5px] font-bold text-[#f0c968]">Options</label>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <input className={inputCls} value={opt} onChange={(e) => setOptions((o) => o.map((x, idx) => (idx === i ? e.target.value : x)))} placeholder={`Option ${i + 1}`} />
                    {options.length > 2 && (
                      <IconBtn label="Remove option" danger onClick={() => setOptions((o) => o.filter((_, idx) => idx !== i))}><X size={14} /></IconBtn>
                    )}
                  </div>
                ))}
                <button className={linkCls} onClick={() => setOptions((o) => [...o, ""])}>+ Add option</button>
              </div>
            </div>
            <div className="flex justify-end gap-2.5 px-4 py-3 sm:px-4.5 sm:py-3.5 border-t border-[#e0a52e]/[0.14]">
              <button className={ghostBtn} onClick={() => setCreating(false)}>Cancel</button>
              <button className={dangerBtn} onClick={submit}>Publish poll</button>
            </div>
          </div>
        </div>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this poll?"
          message={`"${toDelete.question}" and all its votes will be permanently removed.`}
          confirmLabel="Delete" danger
          onCancel={() => setToDelete(null)}
          onConfirm={() => { setPolls((list) => list.filter((p) => p.id !== toDelete.id)); setToDelete(null); }}
        />
      )}
    </div>
  );
}

function BookingsTab({ bookings, setBookings, loading }) {
  const statusTone = { going: "emerald", maybe: "gold", no: "crimson" };
  const [confirming, setConfirming] = useState(null); 
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const openConfirm = (booking) => {
    setConfirming(booking);
    setMessage(booking.confirmationMessage || "Your spot is confirmed — see you at Titans Arena!");
  };

  const sendConfirmation = async () => {
    const target = confirming;
    setSaving(true);
    try {
      const res = await fetch(`${API}/bookings/${target._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true, confirmationMessage: message.trim() }),
      });
      const data = await res.json();
      if (data.modifiedCount) {
        setBookings((list) =>
          list.map((b) => (b._id === target._id ? { ...b, confirmed: true, confirmationMessage: message.trim() } : b))
        );
      }
    } catch (err) {
      console.error("Failed to send confirmation:", err);
    } finally {
      setSaving(false);
      setConfirming(null);
    }
  };

  const revokeConfirmation = async (booking) => {
    try {
      const res = await fetch(`${API}/bookings/${booking._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: false, confirmationMessage: "" }),
      });
      const data = await res.json();
      if (data.modifiedCount) {
        setBookings((list) =>
          list.map((b) => (b._id === booking._id ? { ...b, confirmed: false, confirmationMessage: "" } : b))
        );
      }
    } catch (err) {
      console.error("Failed to revoke confirmation:", err);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead eyebrow="FAN ACTIVITY" title="BOOKINGS & RSVPs" />
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl">
        <table className="w-full min-w-[680px] sm:min-w-0 border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Fan", "Match", "RSVP", "Ticket type", "Submitted", "Confirmation", ""].map((h) => (
                <th key={h} className="text-left font-['Poppins',sans-serif] font-semibold text-[11px] tracking-[0.04em] text-[#4d7e69] uppercase px-3.5 py-3 border-b border-[#e0a52e]/[0.14] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] font-bold whitespace-nowrap text-[#f4f1e6]">{b.fanName}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{b.matchLabel}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap"><Badge tone={statusTone[b.status]}>{b.status}</Badge></td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{b.ticketType}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{formatFullDate(b.submittedAt)}</td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap">
                  {b.confirmed ? <Badge tone="emerald">Confirmed</Badge> : <Badge tone="slate">Pending</Badge>}
                </td>
                <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap">
                  {b.status === "going" && (
                    b.confirmed ? (
                      <button className={linkCls} onClick={() => revokeConfirmation(b)}>Revoke</button>
                    ) : (
                      <button className={linkCls} onClick={() => openConfirm(b)}>
                        <Check size={13} /> Confirm
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
            {!loading && bookings.length === 0 && <tr><td colSpan={7} className="text-center text-[#4d7e69] py-6">No RSVPs from registered fans yet.</td></tr>}
            {loading && <tr><td colSpan={7} className="text-center text-[#4d7e69] py-6">Loading bookings...</td></tr>}
          </tbody>
        </table>
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 sm:p-4" onClick={() => setConfirming(null)}>
          <div className="w-full max-w-md bg-[#143a2c] border border-[#e0a52e]/25 rounded-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3.5 sm:px-4.5 sm:py-4 border-b border-[#e0a52e]/[0.14]">
              <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase text-base text-[#f4f1e6]">CONFIRM BOOKING</h3>
              <IconBtn label="Close" onClick={() => setConfirming(null)}><X size={18} /></IconBtn>
            </div>
            <div className="px-4 py-3.5 sm:px-4.5 sm:py-4">
              <p className="text-[13.5px] text-[#f4f1e6]/80 mb-2.5">
                {confirming.fanName}'s RSVP for {confirming.matchLabel} will show as confirmed on their dashboard.
              </p>
              <label className="text-[12.5px] font-bold text-[#f0c968]">Message to fan</label>
              <textarea className={`${inputCls} resize-y mt-1.5`} rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2.5 px-4 py-3 sm:px-4.5 sm:py-3.5 border-t border-[#e0a52e]/[0.14]">
              <button className={ghostBtn} onClick={() => setConfirming(null)}>Cancel</button>
              <button className={dangerBtn} disabled={saving} onClick={sendConfirmation}>
                {saving ? "Sending..." : "Send confirmation"}
              </button>
            </div>
          </div>
        </div>
      )}
      <p className="text-[12.5px] text-[#4d7e69] mt-1">
        Every row here comes from a fan's own Fanzone account RSVP-ing on the Bookings &amp; RSVPs tab of their dashboard — nothing here is mock data.
      </p>
    </div>
  );
}

function ReviewsTab({ reviews, setReviews, loading }) {
  const [toDelete, setToDelete] = useState(null);
  const statusTone = { pending: "gold", published: "emerald", hidden: "crimson" };

  const setStatus = async (id, status) => {
    const previous = reviews;
    setReviews((list) => list.map((r) => (r._id === id ? { ...r, status } : r))); // optimistic
    try {
      const res = await fetch(`${API}/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!data.modifiedCount) setReviews(previous);
    } catch (err) {
      console.error("Failed to update review status:", err);
      setReviews(previous);
    }
  };

  const confirmDelete = async () => {
    const id = toDelete._id;
    const previous = reviews;
    setReviews((list) => list.filter((r) => r._id !== id)); 
    setToDelete(null);
    try {
      const res = await fetch(`${API}/reviews/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.deletedCount) setReviews(previous);
    } catch (err) {
      console.error("Failed to delete review:", err);
      setReviews(previous);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead eyebrow="MODERATION" title="FAN REVIEWS" />
      <div className="flex flex-col gap-3">
        {reviews.map((r) => (
          <div key={r._id} className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl px-4 py-4 sm:px-5 sm:py-4.5 flex items-start justify-between gap-4 flex-col sm:flex-row">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <Badge tone={statusTone[r.status]}>{r.status}</Badge>
                <span className="font-bold text-[#f4f1e6]">{r.fanName}</span>
                <span className="text-[12.5px] text-[#4d7e69]">&middot; {r.match} &middot; {formatFullDate(r.date)}</span>
              </div>
              <Stars value={r.rating} />
              <p className="text-[13.5px] text-[#f4f1e6]/85 mt-2 leading-relaxed max-w-[60ch]">{r.comment}</p>
            </div>
            <div className="flex gap-1.5 self-end sm:self-start shrink-0">
              {r.status !== "published" && <IconBtn label="Publish" onClick={() => setStatus(r._id, "published")}><Check size={14} /></IconBtn>}
              {r.status !== "hidden" && <IconBtn label="Hide" onClick={() => setStatus(r._id, "hidden")}><EyeOff size={14} /></IconBtn>}
              <IconBtn label="Delete" danger onClick={() => setToDelete(r)}><Trash2 size={14} /></IconBtn>
            </div>
          </div>
        ))}
        {!loading && reviews.length === 0 && <p className="text-[13.5px] text-[#4d7e69]">No reviews from registered fans yet.</p>}
        {loading && <p className="text-[13.5px] text-[#4d7e69]">Loading reviews...</p>}
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this review?"
          message={`${toDelete.fanName}'s review will be permanently removed.`}
          confirmLabel="Delete" danger
          onCancel={() => setToDelete(null)}
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}


function UsersTab({ users, setUsers, loading }) {
  const { setUserRole } = useAuth();
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState(null);
  const [actionError, setActionError] = useState("");

  const filtered = useMemo(
    () => users.filter((u) => u.name?.toLowerCase().includes(query.toLowerCase()) || u.email?.toLowerCase().includes(query.toLowerCase())),
    [users, query]
  );

  const applyRole = async () => {
    const { user, nextRole } = pending;
    setPending(null);
    setActionError("");
    try {
      const data = await setUserRole(user._id, nextRole);
      if (data.modifiedCount) {
        setUsers((list) => list.map((u) => (u._id === user._id ? { ...u, role: nextRole } : u)));
      }
    } catch (err) {
      console.error("Failed to update user role:", err);
      setActionError("Couldn't update that user's role. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1040px]">
      <SectionHead
        eyebrow="ACCESS CONTROL"
        title="USERS & ROLES"
        action={
          <input
            className={`${inputCls} w-full sm:max-w-[240px]`}
            placeholder="Search by name or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        }
      />

      {actionError && <p className="text-[#f4a3af] text-[13px] -mt-2">{actionError}</p>}

      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-xl">
        <table className="w-full min-w-[560px] sm:min-w-0 border-collapse text-[13.5px]">
          <thead>
            <tr>
              {["Name", "Email", "Role", "Joined", ""].map((h) => (
                <th key={h} className="text-left font-['Poppins',sans-serif] font-semibold text-[11px] tracking-[0.04em] text-[#4d7e69] uppercase px-3.5 py-3 border-b border-[#e0a52e]/[0.14] whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => {
              const isPrimaryAdmin = (u.email || "").trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();
              return (
                <tr key={u._id}>
                  <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] font-bold whitespace-nowrap text-[#f4f1e6]">{u.name}</td>
                  <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{u.email}</td>
                  <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap"><Badge tone={u.role === "admin" ? "gold" : "slate"}>{u.role || "fan"}</Badge></td>
                  <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap text-[#f4f1e6]">{formatFullDate(u.joined)}</td>
                  <td className="px-3.5 py-2.5 border-b border-[#e0a52e]/[0.08] whitespace-nowrap">
                    {isPrimaryAdmin ? (
                      <span className="text-[12.5px] text-[#4d7e69] font-['Poppins',sans-serif] font-medium">Primary admin</span>
                    ) : u.role === "admin" ? (
                      <button className={`${linkCls} text-[#f4a3af] hover:text-[#d1374c]`} onClick={() => setPending({ user: u, nextRole: "fan" })}>
                        <ArrowDownCircle size={14} /> Revoke admin
                      </button>
                    ) : (
                      <button className={linkCls} onClick={() => setPending({ user: u, nextRole: "admin" })}>
                        <ArrowUpCircle size={14} /> Promote to admin
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center text-[#4d7e69] py-6">No users match your search.</td></tr>
            )}
            {loading && (
              <tr><td colSpan={5} className="text-center text-[#4d7e69] py-6">Loading users...</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {pending && (
        <ConfirmDialog
          title={pending.nextRole === "admin" ? "Promote to admin?" : "Revoke admin access?"}
          message={
            pending.nextRole === "admin"
              ? `${pending.user.name} will gain full access to this admin dashboard, including matches, players, and user roles. They'll get admin access the next time they log in.`
              : `${pending.user.name} will lose admin access and return to a regular fan account.`
          }
          confirmLabel={pending.nextRole === "admin" ? "Promote" : "Revoke"}
          danger={pending.nextRole === "fan"}
          onCancel={() => setPending(null)}
          onConfirm={applyRole}
        />
      )}
    </div>
  );
}


export default function TitansAdminDashboard() {
  useGoogleFonts();
  const { fetchAllUsers } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [matches, setMatches] = useState([]);
  const [players, setPlayers] = useState([]);
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [polls, setPolls] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const mongoEndpoints = [
      { key: "matches", setter: setMatches },
      { key: "players", setter: setPlayers },
      { key: "news", setter: setNews },
      { key: "bookings", setter: setBookings },
      { key: "reviews", setter: setReviews },
    ];

    Promise.allSettled([
      ...mongoEndpoints.map(({ key }) =>
        fetch(`${API}/${key}`).then((r) => {
          if (!r.ok) throw new Error(`${key} responded ${r.status}`);
          return r.json();
        })
      ),
      fetchAllUsers(),
    ]).then((results) => {
      if (cancelled) return;
      mongoEndpoints.forEach(({ key, setter }, i) => {
        const result = results[i];
        if (result.status === "fulfilled") {
          setter(result.value);
        } else {
          console.error(`Failed to load ${key}:`, result.reason);
        }
      });
      const usersResult = results[mongoEndpoints.length];
      if (usersResult.status === "fulfilled") {
        setUsers(usersResult.value);
      } else {
        console.error("Failed to load users:", usersResult.reason);
      }
      setDataLoading(false);
    });

    return () => { cancelled = true; };
  }, [fetchAllUsers]);

  const navigate = (id) => { setActiveTab(id); setSidebarOpen(false); };
  const tabLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  return (
    <div className="min-h-screen flex bg-[#0e2b21] text-[#f4f1e6] font-['Poppins',sans-serif] relative isolate" style={{ colorScheme: "dark" }}>
      <Sidebar active={activeTab} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-4 sm:px-6.5 py-3.5 sm:py-4 border-b border-[#e0a52e]/[0.12] sticky top-0 z-20 bg-[#0e2b21]">
          <div className="flex items-center gap-3 min-w-0">
            <button className="md:hidden w-[30px] h-[30px] flex items-center justify-center rounded-md border border-[#e0a52e]/25 text-[#f4f1e6] shrink-0" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={17} />
            </button>
            <div className="min-w-0">
              <div className="font-['Poppins',sans-serif] text-[11px] sm:text-[12px] font-bold tracking-[0.08em] text-[#e0a52e]">{tabLabel.toUpperCase()}</div>
              <div className="font-['Poppins',sans-serif] font-extrabold uppercase text-lg sm:text-2xl leading-tight text-[#f4f1e6] tracking-tight truncate">ADMIN DASHBOARD</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-[#0b0c0a] text-[#e0a52e] font-['Poppins',sans-serif] font-bold text-[10.5px] sm:text-[11.5px] tracking-[0.04em] px-2 py-1.5 sm:px-2.5 rounded-md border border-[#e0a52e]/35 shrink-0">
            <ShieldCheck size={13} /> <span className="hidden xs:inline">ADMIN</span>
          </div>
        </header>

        <main className="px-4 sm:px-6.5 pt-5 sm:pt-6 pb-14 flex-1">
          {dataLoading && activeTab !== "polls" && (
            <p className="text-[13.5px] text-[#4d7e69] mb-4">Loading dashboard data...</p>
          )}
          {activeTab === "overview" && <OverviewTab matches={matches} players={players} news={news} bookings={bookings} reviews={reviews} users={users} />}
          {activeTab === "matches" && <MatchesTab matches={matches} setMatches={setMatches} />}
          {activeTab === "players" && <PlayersTab players={players} setPlayers={setPlayers} />}
          {activeTab === "news" && <NewsTab news={news} setNews={setNews} />}
          {activeTab === "polls" && <PollsTab polls={polls} setPolls={setPolls} />}
          {activeTab === "bookings" && <BookingsTab bookings={bookings} setBookings={setBookings} loading={dataLoading} />}
          {activeTab === "reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} loading={dataLoading} />}
          {activeTab === "users" && <UsersTab users={users} setUsers={setUsers} loading={dataLoading} />}
        </main>
      </div>
    </div>
  );
}
