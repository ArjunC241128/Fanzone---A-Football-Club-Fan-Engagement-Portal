import { v4 as uuidv4 } from "uuid";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Menu, X, LayoutDashboard, UserCircle, CalendarCheck, Star,
  MessageCircle, Send, ShieldCheck, MapPin, Clock, ChevronRight,
  Check, XCircle, HelpCircle, Bell, Edit3, Trash2, Plus, Award,
  TrendingUp, Sparkles, Ticket, ChevronDown
} from "lucide-react";
import { useAuth } from "./AuthProvider";
import { setFanBooking, fetchFanBookings, createFanReview, fetchFanReviews, deleteFanReview } from "./fanzoneData";

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

// NOTE: The Titan Bot system prompt now lives on the backend (Backend/utils/openai.js),
// since the backend is the one calling the OpenAI API. It's no longer needed here.

function useGoogleFonts() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement("link");
    link.id = FONT_LINK_ID;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap";
    document.head.appendChild(link);
  }, []);
}

const StatBadge = ({ value, label }) => (
  <div className="tf-stat">
    <div className="tf-stat-box">{value}</div>
    <div className="tf-stat-label">{label}</div>
  </div>
);

const Stars = ({ value, onChange, size = 18 }) => {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="tf-stars" role={onChange ? "radiogroup" : undefined}>
      {stars.map((s) => (
        <button
          key={s}
          type="button"
          className="tf-star-btn"
          disabled={!onChange}
          aria-label={`${s} star${s > 1 ? "s" : ""}`}
          onClick={() => onChange && onChange(s)}
        >
          <Star
            size={size}
            fill={s <= value ? "var(--gold-500)" : "none"}
            stroke={s <= value ? "var(--gold-500)" : "var(--pine-400)"}
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
    going: { label: "Going", cls: "tf-pill-going", Icon: Check },
    maybe: { label: "Maybe", cls: "tf-pill-maybe", Icon: HelpCircle },
    no: { label: "Can't go", cls: "tf-pill-no", Icon: XCircle }
  };
  const { label, cls, Icon } = map[status];
  return (
    <span className={`tf-pill ${cls}`}>
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
      {open && <div className="tf-scrim" onClick={onClose} />}
      <aside className={`tf-sidebar ${open ? "tf-sidebar-open" : ""}`}>
        <div className="tf-brand">
          <div className="tf-crest">CT</div>
          <div className="tf-brand-text">
            <div className="tf-brand-name">CHATTOGRAM TITANS</div>
            <div className="tf-brand-sub">FANZONE DASHBOARD</div>
          </div>
          <button className="tf-icon-btn tf-close-only" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="tf-nav">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`tf-nav-item ${active === id ? "tf-nav-item-active" : ""}`}
              onClick={() => onNavigate(id)}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
              {active === id && <ChevronRight size={16} className="tf-nav-chevron" />}
            </button>
          ))}
        </nav>

        <div className="tf-sidebar-footer">
          <ShieldCheck size={16} />
          <span>SINCE 1998 &middot; TITANS ARENA</span>
        </div>
      </aside>
    </>
  );
}

function OverviewTab({ profile, fixtures, reviews, onNavigate }) {
  const nextHome = fixtures.find((f) => f.home) || fixtures[0];
  return (
    <div className="tf-tab">
      <div className="tf-stat-strip">
        <StatBadge value="03" label="Matches Attended" />
        <StatBadge value={String(reviews.length).padStart(2, "0")} label="Reviews Written" />
        <StatBadge value="1.2K" label="Loyalty Points" />
        <StatBadge value="41K" label="Fanzone Rank" />
      </div>

      <div className="tf-grid-2">
        <section className="tf-card tf-ticket">
          <div className="tf-ticket-main">
            <span className="tf-eyebrow">NEXT UP{nextHome?.home ? " · HOME" : ""}</span>
            <h3 className="tf-display-sm">TITANS VS {nextHome.opponent.toUpperCase()}</h3>
            <div className="tf-meta-row">
              <span><Clock size={14} /> {nextHome.date} &middot; {nextHome.time}</span>
              <span><MapPin size={14} /> {nextHome.venue}</span>
            </div>
            <p className="tf-muted">{nextHome.comp}</p>
          </div>
          <div className="tf-ticket-stub">
            <RsvpPill status={nextHome.rsvp} />
            <button className="tf-btn tf-btn-gold" onClick={() => onNavigate("bookings")}>
              Manage RSVP
            </button>
          </div>
        </section>

        <section className="tf-card">
          <div className="tf-card-head">
            <span className="tf-eyebrow">FAN PROFILE</span>
            <button className="tf-link" onClick={() => onNavigate("profile")}>
              Edit <ChevronRight size={14} />
            </button>
          </div>
          <div className="tf-profile-mini">
            <div className="tf-avatar">{profile.initials}</div>
            <div>
              <div className="tf-profile-name">{profile.name}</div>
              <div className="tf-tier-pill"><Award size={13} /> {profile.tier} MEMBER</div>
            </div>
          </div>
          <div className="tf-mini-row"><TrendingUp size={14} /> Member since {profile.memberSince}</div>
          <div className="tf-mini-row"><Sparkles size={14} /> Favourite player: {profile.favPlayer}</div>
        </section>
      </div>

      <section className="tf-card">
        <div className="tf-card-head">
          <span className="tf-eyebrow">RECENT ACTIVITY</span>
        </div>
        <ul className="tf-activity-list">
          {reviews.slice(0, 2).map((r) => (
            <li key={r.id}>
              <Star size={15} fill="var(--gold-500)" stroke="var(--gold-500)" />
              <span>You reviewed <strong>{r.match}</strong> &middot; {r.rating}/5</span>
              <span className="tf-muted-inline">{r.date}</span>
            </li>
          ))}
          {fixtures[0] && (
            <li>
              <Check size={15} color="var(--gold-500)" />
              <span>RSVP'd <strong>{fixtures[0].rsvp || "not yet"}</strong> to Titans vs {fixtures[0].opponent}</span>
              <span className="tf-muted-inline">{fixtures[0].date}</span>
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
    <div className="tf-tab">
      <div className="tf-grid-2">
        <section className="tf-card tf-membercard">
          <div className="tf-membercard-top">
            <div>
              <div className="tf-eyebrow tf-eyebrow-light">FANZONE MEMBER</div>
              <div className="tf-display-sm">{form.name || "YOUR NAME"}</div>
            </div>
            <div className="tf-crest tf-crest-sm">CT</div>
          </div>
          <div className="tf-membercard-avatar">{form.initials || "??"}</div>
          <div className="tf-membercard-row">
            <span>MEMBER SINCE</span>
            <span>{form.memberSince}</span>
          </div>
          <div className="tf-membercard-row">
            <span>TIER</span>
            <span className="tf-mono">{form.tier}</span>
          </div>
          <div className="tf-membercard-row">
            <span>MEMBER ID</span>
            <span className="tf-mono">CTFZ-{form.memberId}</span>
          </div>
        </section>

        <section className="tf-card">
          <div className="tf-card-head">
            <span className="tf-eyebrow">EDIT PROFILE</span>
            {saved && <span className="tf-saved-chip"><Check size={13} /> Saved</span>}
          </div>

          <div className="tf-field">
            <label htmlFor="pf-name">Full name</label>
            <input id="pf-name" className="tf-input" value={form.name} onChange={update("name")} />
          </div>
          <div className="tf-field-row">
            <div className="tf-field">
              <label htmlFor="pf-email">Email</label>
              <input id="pf-email" className="tf-input" type="email" value={form.email} disabled title="Your login email can't be changed here." />
            </div>
            <div className="tf-field">
              <label htmlFor="pf-phone">Phone</label>
              <input id="pf-phone" className="tf-input" value={form.phone} onChange={update("phone")} />
            </div>
          </div>
          <div className="tf-field">
            <label htmlFor="pf-fav">Favourite player</label>
            <input id="pf-fav" className="tf-input" value={form.favPlayer} onChange={update("favPlayer")} />
          </div>
          <div className="tf-field">
            <label htmlFor="pf-bio">Fan bio</label>
            <textarea id="pf-bio" className="tf-input tf-textarea" rows={3} value={form.bio} onChange={update("bio")} />
          </div>

          {error && <p className="tf-error-text">{error}</p>}

          <button className="tf-btn tf-btn-crimson tf-btn-block" onClick={handleSave} disabled={saving}>
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
  return (
    <div className="tf-card tf-fixture">
      <div className="tf-fixture-info">
        <span className="tf-eyebrow">{fixture.comp.toUpperCase()} {fixture.home ? "· HOME" : "· AWAY"}</span>
        <h4 className="tf-fixture-title">Titans vs {fixture.opponent}</h4>
        <div className="tf-meta-row">
          <span><Clock size={14} /> {fixture.date} &middot; {fixture.time}</span>
          <span><MapPin size={14} /> {fixture.venue}</span>
          <span><Ticket size={14} /> {fixture.ticketType}</span>
        </div>
      </div>
      <div className="tf-fixture-perforation" aria-hidden="true" />
      <div className="tf-fixture-actions">
        {options.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`tf-rsvp-btn ${fixture.rsvp === key ? `tf-rsvp-btn-active-${key}` : ""}`}
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

  return (
    <div className="tf-tab">
      <div className="tf-section-title">
        <span className="tf-eyebrow">UPCOMING FIXTURES</span>
        <h3 className="tf-display-sm">BOOKINGS &amp; RSVPs</h3>
      </div>

      {error && <p className="tf-error-text">{error}</p>}

      <div className="tf-fixture-list">
        {fixtures.map((f) => (
          <FixtureCard key={f.id} fixture={f} onSetRsvp={setRsvp} />
        ))}
      </div>

      <div className="tf-section-title tf-section-title-tight">
        <span className="tf-eyebrow">MATCH HISTORY</span>
      </div>
      <div className="tf-card tf-history">
        {MOCK_PAST.map((p) => (
          <div key={p.id} className="tf-history-row">
            <span>Titans vs {p.opponent}</span>
            <span className="tf-mono tf-history-result">{p.result}</span>
            <span className="tf-muted-inline">{p.date}</span>
          </div>
        ))}
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
    <div className="tf-tab">
      <div className="tf-grid-2">
        <section className="tf-card">
          <div className="tf-card-head">
            <span className="tf-eyebrow">WRITE A MATCHDAY REVIEW</span>
          </div>
          <div className="tf-field">
            <label htmlFor="rv-match">Match</label>
            <div className="tf-select-wrap">
              <select id="rv-match" className="tf-input tf-select" value={match} onChange={(e) => setMatch(e.target.value)}>
                <option value="">Select a match you attended</option>
                {attendedOptions.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
              <ChevronDown size={16} className="tf-select-chevron" />
            </div>
          </div>
          <div className="tf-field">
            <label>Rating</label>
            <Stars value={rating} onChange={setRating} size={22} />
          </div>
          <div className="tf-field">
            <label htmlFor="rv-comment">Your review</label>
            <textarea
              id="rv-comment"
              className="tf-input tf-textarea"
              rows={4}
              placeholder="How was the atmosphere, the seats, the matchday experience?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          {error && <p className="tf-error-text">{error}</p>}
          <button className="tf-btn tf-btn-crimson tf-btn-block" onClick={submit} disabled={submitting}>
            {submitting ? "Posting..." : "Post review"}
          </button>
        </section>

        <section className="tf-card">
          <div className="tf-card-head">
            <span className="tf-eyebrow">YOUR REVIEWS</span>
          </div>
          <div className="tf-review-list">
            {reviews.length === 0 && <p className="tf-muted">No reviews yet. Share your first matchday story.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="tf-review-item">
                <div className="tf-review-head">
                  <div>
                    <div className="tf-review-match">{r.match}</div>
                    <div className="tf-muted-inline">{r.date}</div>
                  </div>
                  <button className="tf-icon-btn tf-icon-btn-danger" onClick={() => remove(r.id)} aria-label="Delete review">
                    <Trash2 size={15} />
                  </button>
                </div>
                <Stars value={r.rating} size={15} />
                <p className="tf-review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ---------- Titan Bot chat tab: now talks to the Express/Mongoose backend ----------
function ChatTab() {
  // One stable threadID per mounted session of this tab — generated once via
  // the lazy useState initializer, so it doesn't change on re-render.
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
      if (!text || loading) return; // guards against duplicate/empty submissions

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
    <div className="tf-tab tf-tab-chat">
      <section className="tf-card tf-chat-card">
        <div className="tf-card-head">
          <span className="tf-eyebrow">TITAN BOT</span>
          <span className="tf-chat-status"><span className="tf-dot" /> Online</span>
        </div>

        <div className="tf-chat-scroll" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`tf-bubble-row ${m.role === "user" ? "tf-bubble-row-user" : ""}`}>
              <div className={`tf-bubble ${m.role === "user" ? "tf-bubble-user" : "tf-bubble-bot"}`}>
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
            <div className="tf-bubble-row">
              <div className="tf-bubble tf-bubble-bot tf-bubble-loading">
                <span className="tf-typing-dot" />
                <span className="tf-typing-dot" />
                <span className="tf-typing-dot" />
              </div>
            </div>
          )}
          {error && <div className="tf-chat-error">{error}</div>}
        </div>

        {messages.length < 2 && (
          <div className="tf-suggestions">
            {SUGGESTED_PROMPTS.map((p) => (
              <button key={p} className="tf-chip" onClick={() => send(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div className="tf-chat-input-row">
          <textarea
            className="tf-chat-input"
            rows={1}
            placeholder="Message Titan Bot..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <button className="tf-btn tf-btn-gold tf-send-btn" onClick={() => send()} disabled={loading || !input.trim()} aria-label="Send message">
            <Send size={16} />
          </button>
        </div>
      </section>
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
      <div className="tf-root tf-root-loading">
        <style>{`.tf-root-loading { align-items: center; justify-content: center; background: #0e2b21; color: #f4f1e6; font-family: 'Inter', sans-serif; }`}</style>
        Loading your Fanzone dashboard...
      </div>
    );
  }

  return (
    <div className="tf-root">
      <style>{`
        .tf-root {
          --pine-950: #0a2118;
          --pine-900: #0e2b21;
          --pine-800: #143a2c;
          --pine-700: #1b4a38;
          --pine-600: #235c46;
          --pine-400: #4d7e69;
          --gold-500: #e0a52e;
          --gold-300: #f0c968;
          --cream: #f4f1e6;
          --crimson: #d1374c;
          --crimson-600: #b82c40;
          --ink: #0b0c0a;

          font-family: 'Inter', sans-serif;
          color: var(--cream);
          background: var(--pine-900);
          min-height: 100vh;
          display: flex;
          position: relative;
          isolation: isolate;
        }
        .tf-root * { box-sizing: border-box; }
        .tf-root button { font-family: inherit; cursor: pointer; }
        .tf-root input, .tf-root textarea, .tf-root select { font-family: inherit; }
        .tf-root ::selection { background: var(--gold-500); color: var(--ink); }

        .tf-display-sm {
          font-family: 'Anton', sans-serif;
          font-weight: 400;
          text-transform: uppercase;
          letter-spacing: 0.01em;
          line-height: 1.05;
          font-size: 22px;
          color: var(--cream);
          margin: 4px 0 10px;
        }
        .tf-eyebrow {
          font-family: 'JetBrains Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--gold-500);
        }
        .tf-eyebrow-light { color: var(--gold-300); }
        .tf-mono { font-family: 'JetBrains Mono', monospace; }
        .tf-muted { color: var(--pine-400); font-size: 13.5px; margin: 0; }
        .tf-muted-inline { color: var(--pine-400); font-size: 12px; }

        /* ---------- Sidebar ---------- */
        .tf-sidebar {
          width: 252px;
          flex-shrink: 0;
          background: var(--pine-950);
          border-right: 1px solid rgba(224,165,46,0.14);
          display: flex;
          flex-direction: column;
          position: sticky;
          top: 0;
          height: 100vh;
          z-index: 40;
        }
        .tf-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 22px 18px;
          border-bottom: 1px solid rgba(224,165,46,0.14);
        }
        .tf-crest {
          width: 38px; height: 42px;
          background: var(--ink);
          border: 1.5px solid var(--gold-500);
          clip-path: polygon(50% 0%, 100% 18%, 100% 70%, 50% 100%, 0% 70%, 0% 18%);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Anton', sans-serif;
          color: var(--gold-500);
          font-size: 14px;
          flex-shrink: 0;
        }
        .tf-crest-sm { width: 34px; height: 38px; font-size: 12px; }
        .tf-brand-text { line-height: 1.3; flex: 1; min-width: 0; }
        .tf-brand-name { font-family: 'Anton', sans-serif; font-size: 14px; letter-spacing: 0.03em; }
        .tf-brand-sub { font-family: 'JetBrains Mono', monospace; font-size: 9.5px; color: var(--gold-500); letter-spacing: 0.1em; }
        .tf-close-only { display: none; }

        .tf-nav { display: flex; flex-direction: column; padding: 14px 12px; gap: 3px; flex: 1; }
        .tf-nav-item {
          display: flex; align-items: center; gap: 11px;
          padding: 11px 12px;
          background: transparent; border: none; border-radius: 6px;
          color: var(--cream); opacity: 0.72;
          font-size: 14px; font-weight: 500; text-align: left;
          transition: background 0.15s, opacity 0.15s;
        }
        .tf-nav-item:hover { background: rgba(224,165,46,0.08); opacity: 1; }
        .tf-nav-item-active {
          background: rgba(224,165,46,0.14);
          opacity: 1;
          color: var(--gold-300);
          box-shadow: inset 3px 0 0 var(--gold-500);
        }
        .tf-nav-chevron { margin-left: auto; }
        .tf-sidebar-footer {
          display: flex; align-items: center; gap: 7px;
          padding: 16px 18px;
          border-top: 1px solid rgba(224,165,46,0.14);
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; letter-spacing: 0.06em;
          color: var(--pine-400);
        }
        .tf-scrim { display: none; }

        /* ---------- Shell ---------- */
        .tf-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .tf-topbar {
          display: flex; align-items: center; justify-content: space-between;
          padding: 18px 28px;
          border-bottom: 1px solid rgba(224,165,46,0.12);
          background: linear-gradient(180deg, var(--pine-900), var(--pine-900) 100%);
          position: sticky; top: 0; z-index: 20;
        }
        .tf-topbar-left { display: flex; align-items: center; gap: 14px; }
        .tf-hamburger { display: none; }
        .tf-icon-btn {
          background: transparent; border: 1px solid rgba(224,165,46,0.25);
          color: var(--cream); border-radius: 7px; width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
        }
        .tf-icon-btn-danger { border-color: rgba(209,55,76,0.4); color: var(--crimson); }
        .tf-icon-btn-danger:hover { background: rgba(209,55,76,0.12); }
        .tf-greeting-eyebrow { font-family: 'JetBrains Mono', monospace; font-size: 10.5px; color: var(--gold-500); letter-spacing: 0.1em; }
        .tf-greeting { font-family: 'Anton', sans-serif; font-size: 19px; letter-spacing: 0.01em; }
        .tf-topbar-right { display: flex; align-items: center; gap: 14px; }
        .tf-tier-pill {
          display: flex; align-items: center; gap: 5px;
          background: var(--ink); color: var(--gold-500);
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; padding: 6px 11px; border-radius: 5px;
          border: 1px solid rgba(224,165,46,0.35);
        }
        .tf-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: var(--pine-700); border: 1.5px solid var(--gold-500);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Anton', sans-serif; font-size: 13px; color: var(--gold-300);
          flex-shrink: 0;
        }

        .tf-content { padding: 26px 28px 60px; flex: 1; }
        .tf-tab { display: flex; flex-direction: column; gap: 22px; max-width: 980px; }

        /* ---------- Scoreboard stat strip ---------- */
        .tf-stat-strip { display: flex; gap: 34px; flex-wrap: wrap; padding: 6px 2px 4px; }
        .tf-stat { text-align: left; }
        .tf-stat-box {
          background: var(--ink);
          color: var(--gold-500);
          font-family: 'JetBrains Mono', monospace;
          font-weight: 700;
          font-size: 30px;
          padding: 14px 20px;
          border-radius: 4px;
          min-width: 78px;
          text-align: center;
        }
        .tf-stat-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10.5px; letter-spacing: 0.08em;
          color: var(--pine-400); text-transform: uppercase;
          margin-top: 8px;
        }

        /* ---------- Cards ---------- */
        .tf-grid-2 { display: grid; grid-template-columns: 1.15fr 1fr; gap: 18px; align-items: start; }
        .tf-card {
          background: var(--pine-800);
          border: 1px solid rgba(224,165,46,0.14);
          border-radius: 10px;
          padding: 20px 22px;
        }
        .tf-card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .tf-link { background: none; border: none; color: var(--gold-300); font-size: 12.5px; display: flex; align-items: center; gap: 2px; font-weight: 600; }
        .tf-section-title { display: flex; flex-direction: column; gap: 2px; }
        .tf-section-title-tight { margin-top: 4px; }

        /* Ticket-style hero card */
        .tf-ticket { display: flex; justify-content: space-between; gap: 18px; flex-wrap: wrap; position: relative; }
        .tf-ticket-main { flex: 1; min-width: 220px; }
        .tf-ticket-stub {
          display: flex; flex-direction: column; align-items: flex-end; justify-content: center; gap: 10px;
          border-left: 2px dashed rgba(224,165,46,0.3);
          padding-left: 20px;
        }
        .tf-meta-row { display: flex; gap: 16px; flex-wrap: wrap; font-size: 12.5px; color: var(--cream); opacity: 0.85; margin-bottom: 6px; }
        .tf-meta-row span { display: flex; align-items: center; gap: 5px; }

        .tf-profile-mini { display: flex; align-items: center; gap: 12px; margin: 10px 0 14px; }
        .tf-profile-name { font-weight: 700; font-size: 15px; }
        .tf-mini-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--pine-400); margin-top: 6px; }

        .tf-activity-list { list-style: none; margin: 10px 0 0; padding: 0; display: flex; flex-direction: column; gap: 12px; }
        .tf-activity-list li { display: flex; align-items: center; gap: 9px; font-size: 13px; }
        .tf-activity-list li span:nth-child(2) { flex: 1; }

        /* ---------- Membership card (Profile tab) ---------- */
        .tf-membercard {
          background: radial-gradient(circle at 15% 0%, var(--pine-600), var(--pine-800) 70%);
          border: 1px solid rgba(224,165,46,0.35);
          position: relative;
          overflow: hidden;
        }
        .tf-membercard-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .tf-membercard-avatar {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--ink); border: 2px solid var(--gold-500);
          display: flex; align-items: center; justify-content: center;
          font-family: 'Anton', sans-serif; color: var(--gold-500); font-size: 18px;
          margin: 6px 0 18px;
        }
        .tf-membercard-row {
          display: flex; justify-content: space-between;
          font-family: 'JetBrains Mono', monospace; font-size: 11px;
          padding: 8px 0; border-top: 1px dashed rgba(224,165,46,0.25);
          color: var(--cream); opacity: 0.9;
        }

        /* ---------- Form fields ---------- */
        .tf-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
        .tf-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .tf-field label { font-size: 12px; font-weight: 600; color: var(--gold-300); letter-spacing: 0.02em; }
        .tf-input {
          background: var(--pine-900);
          border: 1px solid rgba(224,165,46,0.22);
          border-radius: 7px;
          padding: 10px 12px;
          color: var(--cream);
          font-size: 13.5px;
          outline: none;
        }
        .tf-input:focus { border-color: var(--gold-500); box-shadow: 0 0 0 3px rgba(224,165,46,0.15); }
        .tf-textarea { resize: vertical; }
        .tf-select-wrap { position: relative; }
        .tf-select { appearance: none; width: 100%; padding-right: 34px; }
        .tf-select-chevron { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: var(--gold-500); pointer-events: none; }

        .tf-saved-chip { display: flex; align-items: center; gap: 5px; color: var(--gold-300); font-size: 12px; font-weight: 700; }
        .tf-error-text { color: #f4a3af; font-size: 12.5px; margin: -6px 0 4px; }

        /* ---------- Buttons ---------- */
        .tf-btn {
          border: none; border-radius: 7px; padding: 10px 16px;
          font-size: 13.5px; font-weight: 700; display: inline-flex; align-items: center; gap: 6px; justify-content: center;
          transition: transform 0.1s, filter 0.15s;
        }
        .tf-btn:active { transform: scale(0.98); }
        .tf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tf-btn-gold { background: var(--gold-500); color: var(--ink); }
        .tf-btn-gold:hover:not(:disabled) { filter: brightness(1.08); }
        .tf-btn-crimson { background: var(--crimson); color: var(--cream); }
        .tf-btn-crimson:hover { background: var(--crimson-600); }
        .tf-btn-block { width: 100%; margin-top: 4px; }

        /* ---------- Stars ---------- */
        .tf-stars { display: flex; gap: 4px; }
        .tf-star-btn { background: none; border: none; padding: 2px; display: flex; }
        .tf-star-btn:disabled { cursor: default; }

        /* ---------- RSVP pill ---------- */
        .tf-pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }
        .tf-pill-going { background: rgba(224,165,46,0.16); color: var(--gold-300); }
        .tf-pill-maybe { background: rgba(244,241,230,0.12); color: var(--cream); }
        .tf-pill-no { background: rgba(209,55,76,0.16); color: #f4a3af; }

        /* ---------- Fixture / booking cards ---------- */
        .tf-fixture-list { display: flex; flex-direction: column; gap: 14px; }
        .tf-fixture {
          display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
        }
        .tf-fixture-info { flex: 1; min-width: 220px; }
        .tf-fixture-title { font-family: 'Anton', sans-serif; font-size: 17px; margin: 2px 0 8px; letter-spacing: 0.01em; }
        .tf-fixture-perforation { width: 1px; align-self: stretch; border-left: 2px dashed rgba(224,165,46,0.25); }
        .tf-fixture-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .tf-rsvp-btn {
          display: flex; align-items: center; gap: 6px;
          background: var(--pine-900); border: 1px solid rgba(224,165,46,0.22);
          color: var(--cream); border-radius: 6px; padding: 8px 12px; font-size: 12.5px; font-weight: 600;
        }
        .tf-rsvp-btn:hover { border-color: var(--gold-500); }
        .tf-rsvp-btn-active-going { background: var(--gold-500); color: var(--ink); border-color: var(--gold-500); }
        .tf-rsvp-btn-active-maybe { background: var(--pine-600); border-color: var(--cream); }
        .tf-rsvp-btn-active-no { background: var(--crimson); border-color: var(--crimson); color: var(--cream); }

        .tf-history { display: flex; flex-direction: column; gap: 2px; }
        .tf-history-row {
          display: flex; align-items: center; gap: 14px;
          padding: 10px 0; border-bottom: 1px dashed rgba(224,165,46,0.15);
          font-size: 13px;
        }
        .tf-history-row:last-child { border-bottom: none; }
        .tf-history-result { color: var(--gold-300); }
        .tf-history-row span:first-child { flex: 1; }

        /* ---------- Reviews ---------- */
        .tf-review-list { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .tf-review-item { border-bottom: 1px solid rgba(224,165,46,0.1); padding-bottom: 14px; }
        .tf-review-item:last-child { border-bottom: none; padding-bottom: 0; }
        .tf-review-head { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .tf-review-match { font-weight: 700; font-size: 13.5px; }
        .tf-review-comment { font-size: 13px; color: var(--cream); opacity: 0.85; margin: 8px 0 0; line-height: 1.5; }

        /* ---------- Chat ---------- */
        .tf-tab-chat { max-width: 720px; }
        .tf-chat-card { display: flex; flex-direction: column; height: 68vh; min-height: 440px; padding-bottom: 16px; }
        .tf-chat-status { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--pine-400); font-family: 'JetBrains Mono', monospace; }
        .tf-dot { width: 7px; height: 7px; border-radius: 50%; background: #6fce8a; box-shadow: 0 0 0 3px rgba(111,206,138,0.18); }
        .tf-chat-scroll { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding: 12px 2px; }
        .tf-bubble-row { display: flex; }
        .tf-bubble-row-user { justify-content: flex-end; }
        .tf-bubble {
          max-width: 78%; padding: 10px 14px; border-radius: 12px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap;
        }
        .tf-bubble-bot { background: var(--pine-900); border: 1px solid rgba(224,165,46,0.18); border-bottom-left-radius: 3px; }
        .tf-bubble-user { background: var(--gold-500); color: var(--ink); font-weight: 500; border-bottom-right-radius: 3px; }
        .tf-bubble-loading { display: flex; gap: 4px; align-items: center; }
        .tf-typing-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold-500); animation: tf-blink 1.1s infinite ease-in-out; }
        .tf-typing-dot:nth-child(2) { animation-delay: 0.15s; }
        .tf-typing-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes tf-blink { 0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; } }
        .tf-chat-error { color: #f4a3af; font-size: 12px; padding: 4px 2px; }

        /* Markdown content inside chat bubbles */
        .tf-bubble p { margin: 0 0 8px; }
        .tf-bubble p:last-child { margin-bottom: 0; }
        .tf-bubble ul, .tf-bubble ol { margin: 6px 0; padding-left: 20px; }
        .tf-bubble li { margin: 3px 0; }
        .tf-bubble pre {
          background: var(--ink);
          padding: 10px;
          border-radius: 6px;
          overflow-x: auto;
          margin: 8px 0;
          white-space: pre;
        }
        .tf-bubble code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.85em;
        }
        .tf-bubble p code {
          background: rgba(0,0,0,0.25);
          padding: 2px 5px;
          border-radius: 4px;
        }
        .tf-bubble a { color: var(--gold-300); }
        .tf-bubble strong { color: var(--gold-300); }

        .tf-suggestions { display: flex; flex-wrap: wrap; gap: 8px; padding: 6px 2px 4px; }
        .tf-chip {
          background: var(--pine-900); border: 1px solid rgba(224,165,46,0.3);
          color: var(--gold-300); border-radius: 20px; padding: 7px 13px; font-size: 12px; font-weight: 600;
        }
        .tf-chip:hover { background: rgba(224,165,46,0.1); }

        .tf-chat-input-row { display: flex; gap: 10px; align-items: flex-end; padding-top: 10px; border-top: 1px solid rgba(224,165,46,0.12); }
        .tf-chat-input {
          flex: 1; resize: none; background: var(--pine-900);
          border: 1px solid rgba(224,165,46,0.25); border-radius: 8px;
          color: var(--cream); padding: 10px 12px; font-size: 13.5px; outline: none; max-height: 100px;
        }
        .tf-chat-input:focus { border-color: var(--gold-500); }
        .tf-send-btn { width: 42px; height: 42px; padding: 0; border-radius: 8px; flex-shrink: 0; }

        /* ---------- Responsive ---------- */
        @media (max-width: 860px) {
          .tf-grid-2 { grid-template-columns: 1fr; }
        }
        @media (max-width: 720px) {
          .tf-sidebar {
            position: fixed; left: 0; top: 0;
            transform: translateX(-100%);
            transition: transform 0.22s ease;
            width: 78%; max-width: 280px;
            box-shadow: 20px 0 40px rgba(0,0,0,0.4);
          }
          .tf-sidebar-open { transform: translateX(0); }
          .tf-close-only { display: flex; margin-left: auto; }
          .tf-scrim { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 30; }
          .tf-hamburger { display: flex; }
          .tf-topbar { padding: 16px; }
          .tf-content { padding: 18px 16px 48px; }
          .tf-stat-strip { gap: 18px; justify-content: space-between; }
          .tf-stat-box { min-width: 64px; font-size: 24px; padding: 11px 14px; }
          .tf-field-row { grid-template-columns: 1fr; }
          .tf-ticket { flex-direction: column; }
          .tf-ticket-stub { border-left: none; border-top: 2px dashed rgba(224,165,46,0.3); padding-left: 0; padding-top: 14px; width: 100%; align-items: flex-start; }
          .tf-tier-pill span { display: none; }
        }
      `}</style>

      <Sidebar active={activeTab} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="tf-main">
        <header className="tf-topbar">
          <div className="tf-topbar-left">
            <button className="tf-icon-btn tf-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div>
              <div className="tf-greeting-eyebrow">{tabLabel.toUpperCase()}</div>
              <div className="tf-greeting">
                {activeTab === "overview" ? `Good to see you, ${profile.name.split(" ")[0]}` : tabLabel}
              </div>
            </div>
          </div>
          <div className="tf-topbar-right">
            <button className="tf-icon-btn" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <div className="tf-tier-pill"><Award size={13} /> <span>{profile.tier} MEMBER</span></div>
            <div className="tf-avatar">{profile.initials}</div>
          </div>
        </header>

        <main className="tf-content">
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
