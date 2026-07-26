import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, X, LayoutDashboard, UserCircle, CalendarCheck, Star,
  MessageCircle, Send, ShieldCheck, MapPin, Clock, ChevronRight,
  Check, XCircle, HelpCircle, Bell, Trash2, Award,
  TrendingUp, Sparkles, Ticket, ChevronDown, Search
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { setFanBooking, fetchFanBookings, createFanReview, fetchFanReviews, deleteFanReview } from "./fanzoneData";

/* ---------- Color reference (Tailwind arbitrary values used throughout) ----------
   pine-950 #0a2118   pine-900 #0e2b21   pine-800 #143a2c   pine-700 #1b4a38
   pine-600 #235c46   pine-400 #4d7e69   gold-500 #e0a52e   gold-300 #f0c968
   cream    #f4f1e6   crimson  #d1374c   crimson-600 #b82c40   ink #0b0c0a
------------------------------------------------------------------------------- */

function getInitials(name, email) {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] || "") + (parts[1]?.[0] || parts[0]?.[1] || "")).toUpperCase();
  }
  return (email || "??").slice(0, 2).toUpperCase();
}

function formatMemberSince(joined) {
  if (!joined) return new Date().getFullYear().toString();
  const date = typeof joined.toDate === "function" ? joined.toDate() : new Date(joined);
  return Number.isNaN(date.getTime()) ? new Date().getFullYear().toString() : date.getFullYear().toString();
}
function formatFullDate(value) {
  if (!value) return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  }
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

const FONT_LINK_ID = "titans-fanzone-fonts";

const MOCK_FIXTURES = [
  { id: "f1", opponent: "Sylhet Strikers", comp: "Premier League", date: "Sat, 12 Jul 2026", time: "7:00 PM", venue: "Titans Arena", home: true, rsvp: null, ticketType: "Fanzone Stand" },
  { id: "f2", opponent: "Khulna Royals", comp: "Federation Cup", date: "Sun, 20 Jul 2026", time: "5:30 PM", venue: "Titans Arena", home: true, rsvp: null, ticketType: "General" },
  { id: "f3", opponent: "Rajshahi Warriors", comp: "Premier League", date: "Fri, 02 Aug 2026", time: "8:00 PM", venue: "Warriors Ground", home: false, rsvp: null, ticketType: "Away Travel" },
  { id: "f4", opponent: "Dhaka Dominators", comp: "Premier League", date: "Sat, 16 Aug 2026", time: "7:00 PM", venue: "Titans Arena", home: true, rsvp: null, ticketType: "Fanzone Stand" }
];

const MOCK_PAST = [
  { id: "p1", opponent: "Barisal Buccaneers", date: "22 Jun 2026", result: "W 3-1" },
  { id: "p2", opponent: "Comilla Cyclones", date: "08 Jun 2026", result: "D 1-1" }
];

const SUGGESTED_PROMPTS = [
  "When is the next home match?",
  "How do I change my RSVP?",
  "What does Fanzone membership include?"
];

// NOTE: Titan Bot's system prompt now lives on the backend (Backend/utils/openai.js),
// since the backend is the one calling the OpenAI API.

function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap";
    document.head.appendChild(link);
  }, []);
}

const StatBadge = ({ value, label }) => (
  <div className="text-left">
    <div className="bg-[#0b0c0a] text-[#e0a52e] font-['Poppins',sans-serif] font-bold text-2xl sm:text-[28px] px-4 py-3 sm:px-5 sm:py-3.5 rounded min-w-[70px] sm:min-w-[78px] text-center max-[720px]:min-w-[64px] max-[720px]:text-2xl max-[720px]:px-3.5 max-[720px]:py-2.5">
      {value}
    </div>
    <div className="font-['Poppins',sans-serif] font-semibold text-[11px] tracking-[0.05em] text-[#4d7e69] uppercase mt-2">
      {label}
    </div>
  </div>
);

const Stars = ({ value, onChange, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex gap-1" role={onChange ? "radiogroup" : undefined}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className="bg-transparent border-none p-0.5 flex disabled:cursor-default"
          disabled={!onChange}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange && onChange(s)}
        >
          <Star
            size={size}
            fill={s <= value ? "#e0a52e" : "none"}
            stroke={s <= value ? "#e0a52e" : "#4d7e69"}
            strokeWidth={1.75}
          />
        </button>
      ))}
    </div>
  );
};

const RsvpPill = ({ status }) => {
  if (!status) return null;
  const map = {
    going: { label: "Going", cls: "bg-[#e0a52e]/[0.16] text-[#f0c968]", Icon: Check },
    maybe: { label: "Maybe", cls: "bg-[#f4f1e6]/[0.12] text-[#f4f1e6]", Icon: HelpCircle },
    no: { label: "Can't go", cls: "bg-[#d1374c]/[0.16] text-[#f4a3af]", Icon: XCircle }
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold ${cls}`}>
      <Icon size={13} strokeWidth={2.5} />
      {label}
    </span>
  );
};

const NAV_ITEMS = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "profile", label: "My Profile", Icon: UserCircle },
  { id: "bookings", label: "Bookings & RSVPs", Icon: CalendarCheck },
  { id: "reviews", label: "My Reviews", Icon: Star },
  { id: "chat", label: "Titan Bot", Icon: MessageCircle }
];

function Sidebar({ active, onNavigate, open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 max-[720px]:block hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`w-[82%] xs:w-[78%] max-w-[280px] max-[720px]:fixed max-[720px]:left-0 max-[720px]:top-0 max-[720px]:shadow-[20px_0_40px_rgba(0,0,0,0.4)] max-[720px]:transition-transform max-[720px]:duration-200 ${
          open ? "max-[720px]:translate-x-0" : "max-[720px]:-translate-x-full"
        } min-[721px]:w-[230px] min-[900px]:w-[252px] min-[721px]:max-w-none min-[721px]:shadow-none min-[721px]:translate-x-0
        flex-shrink-0 bg-[#0a2118] border-r border-[#e0a52e]/[0.14] flex flex-col sticky top-0 h-screen z-40`}
      >
        <div className="flex items-center gap-2.5 px-[18px] py-[22px] border-b border-[#e0a52e]/[0.14]">
          <div className="w-[38px] h-[42px] bg-[#0b0c0a] border-[1.5px] border-[#e0a52e] [clip-path:polygon(50%_0%,100%_18%,100%_70%,50%_100%,0%_70%,0%_18%)] flex items-center justify-center font-['Poppins',sans-serif] font-extrabold text-[#e0a52e] text-sm flex-shrink-0">
            CT
          </div>
          <div className="leading-[1.3] flex-1 min-w-0">
            <div className="font-['Poppins',sans-serif] font-bold text-sm tracking-wide text-[#f4f1e6] truncate">CHATTOGRAM TITANS</div>
            <div className="font-['Poppins',sans-serif] font-semibold text-[10px] text-[#e0a52e] tracking-[0.08em]">FANZONE DASHBOARD</div>
          </div>
          <button
            className="hidden max-[720px]:flex ml-auto bg-transparent border border-[#e0a52e]/25 text-[#f4f1e6] rounded-[7px] w-[34px] h-[34px] items-center justify-center"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col px-3 py-3.5 gap-[3px] flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`flex items-center gap-[11px] px-3 py-[11px] bg-transparent border-none rounded-md text-sm font-medium text-left transition-colors ${
                active === id
                  ? "bg-[#e0a52e]/[0.14] opacity-100 text-[#f0c968] shadow-[inset_3px_0_0_#e0a52e]"
                  : "text-[#f4f1e6] opacity-70 hover:bg-[#e0a52e]/[0.08] hover:opacity-100"
              }`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={18} strokeWidth={2} className="shrink-0" />
              <span>{label}</span>
              {active === id && <ChevronRight size={16} className="ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-[7px] px-[18px] py-4 border-t border-[#e0a52e]/[0.14] font-['Poppins',sans-serif] font-medium text-[10.5px] tracking-[0.04em] text-[#4d7e69]">
          <ShieldCheck size={16} className="shrink-0" />
          <span>SINCE 1998 &middot; TITANS ARENA</span>
        </div>
      </aside>
    </>
  );
}

function OverviewTab({ profile, fixtures, reviews, onNavigate }) {
  const nextHome = fixtures.find((f) => f.home) || fixtures[0];
  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px] max-w-[980px]">
      <div className="flex gap-[22px] sm:gap-[34px] flex-wrap px-0.5 pt-1.5 pb-1 max-[720px]:gap-[18px] max-[720px]:justify-between">
        <StatBadge value="03" label="Matches Attended" />
        <StatBadge value={String(reviews.length).padStart(2, "0")} label="Reviews Written" />
        <StatBadge value="1.2K" label="Loyalty Points" />
        <StatBadge value="41K" label="Fanzone Rank" />
      </div>

      <div className="grid grid-cols-[1.15fr_1fr] gap-[18px] items-start max-[860px]:grid-cols-1">
        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5 flex justify-between gap-[18px] flex-wrap relative max-[720px]:flex-col">
          <div className="flex-1 min-w-[220px]">
            <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">
              NEXT UP{nextHome?.home ? " · HOME" : ""}
            </span>
            <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase tracking-tight leading-[1.1] text-[21px] sm:text-[24px] text-[#f4f1e6] my-1 mb-2.5 break-words">
              TITANS VS {nextHome.opponent.toUpperCase()}
            </h3>
            <div className="flex gap-4 flex-wrap text-[13px] text-[#f4f1e6] opacity-85 mb-1.5">
              <span className="flex items-center gap-1.5"><Clock size={14} className="shrink-0" /> {nextHome.date} &middot; {nextHome.time}</span>
              <span className="flex items-center gap-1.5"><MapPin size={14} className="shrink-0" /> {nextHome.venue}</span>
            </div>
            <p className="text-[#4d7e69] text-[14px] m-0">{nextHome.comp}</p>
          </div>
          <div className="flex flex-col items-end justify-center gap-2.5 border-l-2 border-dashed border-[#e0a52e]/30 pl-5 max-[720px]:border-l-0 max-[720px]:border-t-2 max-[720px]:pl-0 max-[720px]:pt-3.5 max-[720px]:w-full max-[720px]:items-start">
            <RsvpPill status={nextHome.rsvp} />
            <button className="border-none rounded-[7px] px-4 py-2.5 text-[14px] font-bold inline-flex items-center gap-1.5 justify-center transition active:scale-[0.98] bg-[#e0a52e] text-[#0b0c0a] hover:brightness-[1.08] max-[720px]:w-full" onClick={() => onNavigate("bookings")}>
              Manage RSVP
            </button>
          </div>
        </section>

        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">FAN PROFILE</span>
            <button className="bg-none border-none text-[#f0c968] text-[13px] flex items-center gap-0.5 font-semibold" onClick={() => onNavigate("profile")}>
              Edit <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex items-center gap-3 my-2.5 mb-3.5">
            <div className="w-[38px] h-[38px] rounded-full bg-[#1b4a38] border-[1.5px] border-[#e0a52e] flex items-center justify-center font-['Poppins',sans-serif] font-bold text-[14px] text-[#f0c968] flex-shrink-0">
              {profile.initials}
            </div>
            <div className="min-w-0">
              <div className="font-bold text-[15.5px] text-[#f4f1e6] truncate">{profile.name}</div>
              <div className="flex items-center gap-[5px] bg-[#0b0c0a] text-[#e0a52e] font-['Poppins',sans-serif] text-[11.5px] font-bold tracking-[0.06em] px-[11px] py-1.5 rounded-[5px] border border-[#e0a52e]/35 w-fit">
                <Award size={13} className="shrink-0" /> {profile.tier} MEMBER
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-[#4d7e69] mt-1.5"><TrendingUp size={14} className="shrink-0" /> Member since {profile.memberSince}</div>
          <div className="flex items-center gap-2 text-[13px] text-[#4d7e69] mt-1.5"><Sparkles size={14} className="shrink-0" /> Favourite player: {profile.favPlayer}</div>
        </section>
      </div>

      <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">RECENT ACTIVITY</span>
        </div>
        <ul className="list-none m-0 mt-2.5 p-0 flex flex-col gap-3">
          {reviews.slice(0, 2).map((r) => (
            <li key={r.id} className="flex items-center gap-2.5 text-[13.5px] text-[#f4f1e6] flex-wrap">
              <Star size={15} fill="#e0a52e" stroke="#e0a52e" className="shrink-0" />
              <span className="flex-1 min-w-[160px]">You reviewed <strong className="text-[#f0c968]">{r.match}</strong> &middot; {r.rating}/5</span>
              <span className="text-[#4d7e69] text-xs">{r.date}</span>
            </li>
          ))}
          {fixtures[0] && (
            <li className="flex items-center gap-2.5 text-[13.5px] text-[#f4f1e6] flex-wrap">
              <Check size={15} color="#e0a52e" className="shrink-0" />
              <span className="flex-1 min-w-[160px]">RSVP'd <strong className="text-[#f0c968]">{fixtures[0].rsvp || "not yet"}</strong> to Titans vs {fixtures[0].opponent}</span>
              <span className="text-[#4d7e69] text-xs">{fixtures[0].date}</span>
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function ProfileTab({ profile, setProfile }) {
  const { updateUserProfile } = useAuth();
  const [form, setForm] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setForm(profile), [profile]);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const editable = { name: form.name, phone: form.phone, favPlayer: form.favPlayer, bio: form.bio };
      await updateUserProfile(editable);
      setProfile((p) => ({ ...p, ...editable }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2600);
    } catch (err) {
      setError("Couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px] max-w-[980px]">
      <div className="grid grid-cols-[1.15fr_1fr] gap-[18px] items-start max-[860px]:grid-cols-1">
        <section className="relative overflow-hidden rounded-[10px] border border-[#e0a52e]/35 px-[18px] py-4 sm:px-[22px] sm:py-5 [background:radial-gradient(circle_at_15%_0%,#235c46,#143a2c_70%)]">
          <div className="flex justify-between items-start">
            <div className="min-w-0">
              <div className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#f0c968]">FANZONE MEMBER</div>
              <div className="font-['Poppins',sans-serif] font-extrabold uppercase tracking-tight leading-[1.1] text-[21px] sm:text-[24px] text-[#f4f1e6] my-1 mb-2.5 truncate">
                {form.name || "YOUR NAME"}
              </div>
            </div>
            <div className="w-[34px] h-[38px] bg-[#0b0c0a] border-[1.5px] border-[#e0a52e] [clip-path:polygon(50%_0%,100%_18%,100%_70%,50%_100%,0%_70%,0%_18%)] flex items-center justify-center font-['Poppins',sans-serif] font-extrabold text-[#e0a52e] text-xs flex-shrink-0">
              CT
            </div>
          </div>
          <div className="w-14 h-14 rounded-full bg-[#0b0c0a] border-2 border-[#e0a52e] flex items-center justify-center font-['Poppins',sans-serif] font-bold text-[#e0a52e] text-lg my-1.5 mb-[18px]">
            {form.initials || "??"}
          </div>
          <div className="flex justify-between font-['Poppins',sans-serif] font-medium text-[11.5px] py-2 border-t border-dashed border-[#e0a52e]/25 text-[#f4f1e6] opacity-90">
            <span>MEMBER SINCE</span>
            <span>{form.memberSince}</span>
          </div>
          <div className="flex justify-between font-['Poppins',sans-serif] font-medium text-[11.5px] py-2 border-t border-dashed border-[#e0a52e]/25 text-[#f4f1e6] opacity-90">
            <span>TIER</span>
            <span className="font-['Poppins',sans-serif] font-semibold">{form.tier}</span>
          </div>
          <div className="flex justify-between font-['Poppins',sans-serif] font-medium text-[11.5px] py-2 border-t border-dashed border-[#e0a52e]/25 text-[#f4f1e6] opacity-90">
            <span>MEMBER ID</span>
            <span className="font-['Poppins',sans-serif] font-semibold">CTFZ-{form.memberId}</span>
          </div>
        </section>

        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">EDIT PROFILE</span>
            {saved && (
              <span className="flex items-center gap-[5px] text-[#f0c968] text-xs font-bold">
                <Check size={13} /> Saved
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5 mb-3.5">
            <label htmlFor="pf-name" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Full name</label>
            <input id="pf-name" className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]" value={form.name} onChange={update("name")} />
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[720px]:grid-cols-1">
            <div className="flex flex-col gap-1.5 mb-3.5">
              <label htmlFor="pf-email" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Email</label>
              <input id="pf-email" className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none" type="email" value={form.email} disabled title="Your login email can't be changed here." />
            </div>
            <div className="flex flex-col gap-1.5 mb-3.5">
              <label htmlFor="pf-phone" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Phone</label>
              <input id="pf-phone" className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]" value={form.phone} onChange={update("phone")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label htmlFor="pf-fav" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Favourite player</label>
            <input id="pf-fav" className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]" value={form.favPlayer} onChange={update("favPlayer")} />
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label htmlFor="pf-bio" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Fan bio</label>
            <textarea id="pf-bio" className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none resize-y focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]" rows={3} value={form.bio} onChange={update("bio")} />
          </div>

          {error && <p className="text-[#f4a3af] text-[13px] -mt-1.5 mb-1">{error}</p>}

          <button className="border-none rounded-[7px] px-4 py-2.5 text-[14px] font-bold inline-flex items-center gap-1.5 justify-center transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#d1374c] text-[#f4f1e6] hover:bg-[#b82c40] w-full mt-1" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </section>
      </div>
    </div>
  );
}

function FixtureCard({ fixture, onSetRsvp }) {
  const options = [
    { key: "going", label: "Going", Icon: Check },
    { key: "maybe", label: "Maybe", Icon: HelpCircle },
    { key: "no", label: "Can't go", Icon: XCircle }
  ];
  const activeClass = {
    going: "bg-[#e0a52e] text-[#0b0c0a] border-[#e0a52e]",
    maybe: "bg-[#235c46] border-[#f4f1e6]",
    no: "bg-[#d1374c] border-[#d1374c] text-[#f4f1e6]"
  };
  return (
    <div className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5 flex items-center gap-5 flex-wrap">
      <div className="flex-1 min-w-[220px]">
        <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">
          {fixture.comp.toUpperCase()} {fixture.home ? "· HOME" : "· AWAY"}
        </span>
        <h4 className="font-['Poppins',sans-serif] font-bold text-[17px] sm:text-[18px] my-0.5 mb-2 tracking-tight text-[#f4f1e6] break-words">Titans vs {fixture.opponent}</h4>
        <div className="flex gap-3 sm:gap-4 flex-wrap text-[13px] text-[#f4f1e6] opacity-85 mb-1.5">
          <span className="flex items-center gap-1.5"><Clock size={14} className="shrink-0" /> {fixture.date} &middot; {fixture.time}</span>
          <span className="flex items-center gap-1.5"><MapPin size={14} className="shrink-0" /> {fixture.venue}</span>
          <span className="flex items-center gap-1.5"><Ticket size={14} className="shrink-0" /> {fixture.ticketType}</span>
        </div>
      </div>
      <div className="w-px self-stretch border-l-2 border-dashed border-[#e0a52e]/25 max-[540px]:hidden" aria-hidden="true" />
      <div className="flex gap-2 flex-wrap w-full sm:w-auto">
        {options.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 border rounded-md px-3 py-2 text-[13px] font-semibold hover:border-[#e0a52e] ${
              fixture.rsvp === key ? activeClass[key] : "bg-[#0e2b21] border-[#e0a52e]/[0.22] text-[#f4f1e6]"
            }`}
            onClick={() => onSetRsvp(fixture.id, key)}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingsTab({ fixtures, setFixtures }) {
  const { currentUser, profile } = useAuth();
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const setRsvp = async (matchId, status) => {
    if (!currentUser) return;
    const fixture = fixtures.find((f) => f.id === matchId);
    if (!fixture) return;

    const previousRsvp = fixture.rsvp;
    const nextRsvp = previousRsvp === status ? null : status;

    setError("");
    setFixtures((list) => list.map((f) => (f.id === matchId ? { ...f, rsvp: nextRsvp } : f)));

    try {
      if (nextRsvp) {
        await setFanBooking({
          userId: currentUser.uid,
          fanName: profile?.name || currentUser.displayName || "Fanzone Member",
          fanEmail: currentUser.email,
          matchId: fixture.id,
          matchLabel: fixture.home ? `Titans vs ${fixture.opponent}` : `${fixture.opponent} vs Titans`,
          status: nextRsvp,
          ticketType: fixture.ticketType
        });
      }
    } catch (err) {
      console.error("Failed to save RSVP:", err.code || err.message, err);
      setError("Couldn't save your RSVP. Please try again.");
      setFixtures((list) => list.map((f) => (f.id === matchId ? { ...f, rsvp: previousRsvp } : f)));
    }
  };

  // Matches by opponent name or fixture date, case-insensitive. Covers both the
  // upcoming fixtures list and the match history list below it.
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = (item) =>
    !normalizedQuery ||
    item.opponent.toLowerCase().includes(normalizedQuery) ||
    item.date.toLowerCase().includes(normalizedQuery);

  const filteredFixtures = useMemo(
    () => fixtures.filter(matchesQuery),
    [fixtures, normalizedQuery]
  );
  const filteredPast = useMemo(
    () => MOCK_PAST.filter(matchesQuery),
    [normalizedQuery]
  );

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px] max-w-[980px]">
      <div className="flex items-end justify-between gap-3.5 flex-wrap">
        <div className="flex flex-col gap-0.5">
          <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">UPCOMING FIXTURES</span>
          <h3 className="font-['Poppins',sans-serif] font-extrabold uppercase tracking-tight leading-[1.1] text-[21px] sm:text-[24px] text-[#f4f1e6] my-1 mb-2.5">BOOKINGS &amp; RSVPs</h3>
        </div>
        <div className="relative w-full sm:w-[260px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4d7e69] pointer-events-none" />
          <input
            type="text"
            className="w-full bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] pl-9 pr-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]"
            placeholder="Search by opponent or date..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search matches by opponent or date"
          />
        </div>
      </div>

      {error && <p className="text-[#f4a3af] text-[13px] -mt-1.5 mb-1">{error}</p>}

      <div className="flex flex-col gap-3.5">
        {filteredFixtures.map((f) => (
          <FixtureCard key={f.id} fixture={f} onSetRsvp={setRsvp} />
        ))}
        {filteredFixtures.length === 0 && (
          <p className="text-[#4d7e69] text-[14px]">No upcoming fixtures match "{query}".</p>
        )}
      </div>

      <div className="flex flex-col gap-0.5 mt-1">
        <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">MATCH HISTORY</span>
      </div>
      <div className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5 flex flex-col gap-0.5">
        {filteredPast.map((p) => (
          <div key={p.id} className="flex items-center gap-2 sm:gap-3.5 py-2.5 border-b border-dashed border-[#e0a52e]/[0.15] text-[13.5px] last:border-b-0 flex-wrap">
            <span className="flex-1 min-w-[140px] text-[#f4f1e6]">Titans vs {p.opponent}</span>
            <span className="font-['Poppins',sans-serif] font-semibold text-[#f0c968]">{p.result}</span>
            <span className="text-[#4d7e69] text-xs">{p.date}</span>
          </div>
        ))}
        {filteredPast.length === 0 && (
          <p className="text-[#4d7e69] text-[13.5px] py-1">No past matches match "{query}".</p>
        )}
      </div>
    </div>
  );
}

function ReviewsTab({ reviews, setReviews, fixtures }) {
  const { currentUser, profile } = useAuth();
  const [match, setMatch] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const attendedOptions = [...MOCK_PAST.map((p) => `Titans vs ${p.opponent}`)];

  const submit = async () => {
    if (!match || !rating || !comment.trim() || !currentUser) return;
    setError("");
    setSubmitting(true);
    try {
      const saved = await createFanReview({
        userId: currentUser.uid,
        fanName: profile?.name || currentUser.displayName || "Fanzone Member",
        fanEmail: currentUser.email,
        match,
        rating,
        comment: comment.trim()
      });
      setReviews((r) => [{ ...saved, date: formatFullDate(null) }, ...r]);
      setMatch("");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Failed to post review:", err.code || err.message, err);
      setError("Couldn't post your review. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (id) => {
    const previous = reviews;
    setReviews((r) => r.filter((x) => x.id !== id));
    try {
      await deleteFanReview(id);
    } catch (err) {
      console.error("Failed to delete review:", err.code || err.message, err);
      setReviews(previous);
    }
  };

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px] max-w-[980px]">
      <div className="grid grid-cols-[1.15fr_1fr] gap-[18px] items-start max-[860px]:grid-cols-1">
        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">WRITE A MATCHDAY REVIEW</span>
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label htmlFor="rv-match" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Match</label>
            <div className="relative">
              <select
                id="rv-match"
                className="appearance-none w-full pr-[34px] bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]"
                value={match}
                onChange={(e) => setMatch(e.target.value)}
              >
                <option value="">Select a match you attended</option>
                {attendedOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#e0a52e] pointer-events-none" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Rating</label>
            <Stars value={rating} onChange={setRating} size={22} />
          </div>
          <div className="flex flex-col gap-1.5 mb-3.5">
            <label htmlFor="rv-comment" className="text-[12.5px] font-semibold text-[#f0c968] tracking-[0.02em]">Your review</label>
            <textarea
              id="rv-comment"
              className="bg-[#0e2b21] border border-[#e0a52e]/[0.22] rounded-[7px] px-3 py-2.5 text-[#f4f1e6] text-[14px] outline-none resize-y focus:border-[#e0a52e] focus:shadow-[0_0_0_3px_rgba(224,165,46,0.15)]"
              rows={4}
              placeholder="How was the atmosphere, the seats, the matchday experience?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          {error && <p className="text-[#f4a3af] text-[13px] -mt-1.5 mb-1">{error}</p>}
          <button className="border-none rounded-[7px] px-4 py-2.5 text-[14px] font-bold inline-flex items-center gap-1.5 justify-center transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed bg-[#d1374c] text-[#f4f1e6] hover:bg-[#b82c40] w-full mt-1" onClick={submit} disabled={submitting}>
            {submitting ? "Posting..." : "Post review"}
          </button>
        </section>

        <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[18px] py-4 sm:px-[22px] sm:py-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">YOUR REVIEWS</span>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {reviews.length === 0 && <p className="text-[#4d7e69] text-[14px] m-0">No reviews yet. Share your first matchday story.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="border-b border-[#e0a52e]/10 pb-3.5 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <div className="min-w-0">
                    <div className="font-bold text-[14px] text-[#f4f1e6] truncate">{r.match}</div>
                    <div className="text-[#4d7e69] text-xs">{r.date}</div>
                  </div>
                  <button className="bg-transparent border border-[#d1374c]/40 text-[#d1374c] rounded-[7px] w-[34px] h-[34px] flex items-center justify-center hover:bg-[#d1374c]/[0.12] shrink-0" onClick={() => remove(r.id)} aria-label="Delete review">
                    <Trash2 size={15} />
                  </button>
                </div>
                <Stars value={r.rating} size={15} />
                <p className="text-[13.5px] text-[#f4f1e6] opacity-85 mt-2 mb-0 leading-[1.5]">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Titan Bot chat tab: talks to the Express/Mongoose backend ----------
function ChatTab() {
  const [threadID] = useState(() => uuidv4());

  const [messages, setMessages] = useState([
    { role: "assistant", text: "Oi! I'm Titan Bot — ask me about fixtures, your booking, or life as a Titans fan." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = useCallback(
    async (textOverride) => {
      const text = (textOverride ?? input).trim();
      if (!text || loading) return;

      setError("");
      setMessages((m) => [...m, { role: "user", text }]);
      setInput("");
      setLoading(true);

      try {
        const response = await fetch("http://localhost:3000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, threadID })
        });

        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data = await response.json();

        setMessages((m) => [
          ...m,
          { role: "assistant", text: data.reply || "I couldn't quite catch that — try asking again?" }
        ]);
      } catch (err) {
        console.log(err);
        setError("Titan Bot couldn't respond right now. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [input, loading, threadID]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col gap-[18px] sm:gap-[22px] max-w-[720px]">
      <section className="bg-[#143a2c] border border-[#e0a52e]/[0.14] rounded-[10px] px-[14px] py-4 sm:px-[22px] sm:py-5 flex flex-col h-[calc(100vh-220px)] sm:h-[68vh] min-h-[360px] sm:min-h-[440px] pb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-['Poppins',sans-serif] text-[12px] font-bold tracking-[0.1em] text-[#e0a52e]">TITAN BOT</span>
          <span className="flex items-center gap-1.5 text-[12px] text-[#4d7e69] font-['Poppins',sans-serif] font-medium">
            <span className="w-[7px] h-[7px] rounded-full bg-[#6fce8a] shadow-[0_0_0_3px_rgba(111,206,138,0.18)]" />
            Online
          </span>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-0.5 py-3" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : ""}`}>
              <div
                className={`max-w-[86%] sm:max-w-[78%] px-3.5 py-2.5 rounded-xl text-[14px] leading-[1.5] whitespace-pre-wrap
                  [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:my-1.5 [&_ul]:pl-5 [&_ol]:my-1.5 [&_ol]:pl-5 [&_li]:my-1
                  [&_pre]:bg-[#0b0c0a] [&_pre]:p-2.5 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:whitespace-pre
                  [&_code]:font-['Poppins',sans-serif] [&_code]:text-[0.85em]
                  [&_p_code]:bg-black/25 [&_p_code]:px-1.5 [&_p_code]:py-0.5 [&_p_code]:rounded
                  ${
                    m.role === "user"
                      ? "bg-[#e0a52e] text-[#0b0c0a] font-medium rounded-br-[3px]"
                      : "bg-[#0e2b21] border border-[#e0a52e]/[0.18] rounded-bl-[3px] [&_a]:text-[#f0c968] [&_strong]:text-[#f0c968]"
                  }`}
              >
                {m.role === "assistant" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                    {m.text}
                  </ReactMarkdown>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex">
              <div className="max-w-[78%] px-3.5 py-2.5 rounded-xl bg-[#0e2b21] border border-[#e0a52e]/[0.18] rounded-bl-[3px] flex gap-1 items-center">
                <span className="w-[5px] h-[5px] rounded-full bg-[#e0a52e] animate-[tf-blink_1.1s_infinite_ease-in-out]" />
                <span className="w-[5px] h-[5px] rounded-full bg-[#e0a52e] animate-[tf-blink_1.1s_infinite_ease-in-out] [animation-delay:0.15s]" />
                <span className="w-[5px] h-[5px] rounded-full bg-[#e0a52e] animate-[tf-blink_1.1s_infinite_ease-in-out] [animation-delay:0.3s]" />
              </div>
            </div>
          )}
          {error && <div className="text-[#f4a3af] text-xs px-0.5 py-1">{error}</div>}
        </div>

        {messages.length < 2 && (
          <div className="flex flex-wrap gap-2 px-0.5 pt-1.5 pb-1">
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                className="bg-[#0e2b21] border border-[#e0a52e]/30 text-[#f0c968] rounded-full px-3.5 py-1.5 text-xs font-semibold hover:bg-[#e0a52e]/10"
                onClick={() => send(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 sm:gap-2.5 items-end pt-2.5 border-t border-[#e0a52e]/[0.12]">
          <textarea
            className="flex-1 resize-none bg-[#0e2b21] border border-[#e0a52e]/25 rounded-lg text-[#f4f1e6] px-3 py-2.5 text-[14px] outline-none max-h-[100px] focus:border-[#e0a52e]"
            rows={1}
            placeholder="Message Titan Bot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button
            className="border-none rounded-lg w-[42px] h-[42px] p-0 flex-shrink-0 inline-flex items-center justify-center bg-[#e0a52e] text-[#0b0c0a] hover:brightness-[1.08] disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => send()}
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </section>

      <style>{`@keyframes tf-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }`}</style>
    </div>
  );
}

export default function TitansFanzoneDashboard() {
  useGoogleFonts();

  const { currentUser, profile: authProfile, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [fixtures, setFixtures] = useState(MOCK_FIXTURES);
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;

    fetchFanBookings(currentUser.uid)
      .then((bookings) => {
        if (cancelled) return;
        setFixtures((list) =>
          list.map((f) => {
            const booking = bookings.find((b) => b.matchId === f.id);
            return booking ? { ...f, rsvp: booking.status, ticketType: booking.ticketType || f.ticketType } : f;
          })
        );
      })
      .catch((err) => console.error("Failed to load your bookings:", err.code || err.message, err));

    fetchFanReviews(currentUser.uid)
      .then((fanReviews) => {
        if (cancelled) return;
        setReviews(fanReviews.map((r) => ({ ...r, date: formatFullDate(r.date) })));
      })
      .catch((err) => console.error("Failed to load your reviews:", err.code || err.message, err));

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  const derivedProfile = useMemo(() => {
    if (!authProfile || !currentUser) return null;
    return {
      name: authProfile.name || currentUser.displayName || "Fanzone Member",
      initials: getInitials(authProfile.name || currentUser.displayName, authProfile.email || currentUser.email),
      email: authProfile.email || currentUser.email || "",
      phone: authProfile.phone || "",
      favPlayer: authProfile.favPlayer || "",
      bio: authProfile.bio || "",
      tier: (authProfile.tier || "Fan").toUpperCase(),
      memberSince: formatMemberSince(authProfile.joined),
      memberId: (currentUser.uid || "").slice(-6).toUpperCase()
    };
  }, [authProfile, currentUser]);

  const [profile, setProfile] = useState(derivedProfile);
  useEffect(() => {
    if (derivedProfile) setProfile(derivedProfile);
  }, [derivedProfile]);

  const navigate = (id) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const tabLabel = NAV_ITEMS.find((n) => n.id === activeTab)?.label ?? "";

  if (authLoading || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0e2b21] text-[#f4f1e6] font-['Poppins',sans-serif] text-center px-4">
        Loading your Fanzone dashboard...
      </div>
    );
  }

  return (
    <div className="font-['Poppins',sans-serif] text-[#f4f1e6] bg-[#0e2b21] min-h-screen flex relative [isolation:isolate] selection:bg-[#e0a52e] selection:text-[#0b0c0a] [&_button]:font-inherit [&_button]:cursor-pointer [&_input]:font-inherit [&_textarea]:font-inherit [&_select]:font-inherit">
      <Sidebar active={activeTab} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between gap-3 px-4 sm:px-7 py-3.5 sm:py-[18px] border-b border-[#e0a52e]/[0.12] sticky top-0 z-20 bg-[#0e2b21] max-[720px]:px-4">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <button
              className="hidden max-[720px]:flex bg-transparent border border-[#e0a52e]/25 text-[#f4f1e6] rounded-[7px] w-[34px] h-[34px] items-center justify-center shrink-0"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={18} />
            </button>
            <div className="min-w-0">
              <div className="font-['Poppins',sans-serif] text-[11.5px] text-[#e0a52e] tracking-[0.08em] font-semibold">{tabLabel.toUpperCase()}</div>
              <div className="font-['Poppins',sans-serif] font-extrabold text-[17px] sm:text-[21px] tracking-tight truncate">
                {activeTab === "overview" ? `Good to see you, ${profile.name.split(" ")[0]}` : tabLabel}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <button className="hidden xs:flex bg-transparent border border-[#e0a52e]/25 text-[#f4f1e6] rounded-[7px] w-[34px] h-[34px] items-center justify-center" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <div className="flex items-center gap-[5px] bg-[#0b0c0a] text-[#e0a52e] font-['Poppins',sans-serif] text-[11.5px] font-bold tracking-[0.06em] px-[11px] py-1.5 rounded-[5px] border border-[#e0a52e]/35">
              <Award size={13} /> <span className="max-[720px]:hidden">{profile.tier} MEMBER</span>
            </div>
            <div className="w-[38px] h-[38px] rounded-full bg-[#1b4a38] border-[1.5px] border-[#e0a52e] flex items-center justify-center font-['Poppins',sans-serif] font-bold text-[14px] text-[#f0c968] flex-shrink-0">
              {profile.initials}
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-7 pt-4 sm:pt-[26px] pb-[60px] flex-1 max-[720px]:px-4 max-[720px]:pt-[18px] max-[720px]:pb-12">
          {activeTab === "overview" && (
            <OverviewTab profile={profile} fixtures={fixtures} reviews={reviews} onNavigate={navigate} />
          )}
          {activeTab === "profile" && <ProfileTab profile={profile} setProfile={setProfile} />}
          {activeTab === "bookings" && <BookingsTab fixtures={fixtures} setFixtures={setFixtures} />}
          {activeTab === "reviews" && <ReviewsTab reviews={reviews} setReviews={setReviews} fixtures={fixtures} />}
          {activeTab === "chat" && <ChatTab />}
        </main>
      </div>
    </div>
  );
}