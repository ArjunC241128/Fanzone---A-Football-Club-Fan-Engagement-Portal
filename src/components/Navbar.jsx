import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Crest from "./Crest";
import { useAuth } from "./AuthProvider";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/fixtures", label: "Fixtures" },
  { to: "/news", label: "News" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { currentUser, role, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold tracking-wide uppercase transition-colors ${
      isActive ? "text-(--color-gold)" : "text-(--color-line)/80 hover:text-(--color-gold)"
    }`;

  const handleLoginRedirect = () => {
    setOpen(false);
    navigate("/login");
  };

  const handleRegisterRedirect = () => {
    setOpen(false);
    navigate("/register");
  };

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-(--color-pitch) border-b border-(--color-gold)/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex h-18 items-center justify-between py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <Crest size={40} />
            <span className="font-(family-name:--font-display) text-(--color-line) text-xl tracking-wide leading-none">
              CHATTOGRAM TITANS
            </span>
          </NavLink>

          {/* Conditional contextual access links displayed only to matching authorized roles */}
          <div className="hidden md:flex gap-4">
            {currentUser && role === "fan" && (
              <NavLink to="/dashboard" className="text-sm font-semibold uppercase tracking-wide text-(--color-gold)">
                My Fanzone
              </NavLink>
            )}
            {currentUser && role === "admin" && (
              <NavLink to="/admin" className="text-sm font-semibold uppercase tracking-wide text-red-400">
                Admin Console
              </NavLink>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-sm font-semibold uppercase tracking-wide text-red-400 hover:text-red-500 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  onClick={handleLoginRedirect}
                  className="text-sm font-semibold uppercase tracking-wide text-(--color-line)/80 hover:text-(--color-gold) transition-colors cursor-pointer"
                >
                  Log in
                </button>
                <button
                  onClick={handleRegisterRedirect}
                  className="rounded-sm bg-(--color-kit) hover:bg-(--color-kit-dark) px-4 py-2 text-sm font-semibold uppercase tracking-wide text-(--color-line) transition-colors cursor-pointer"
                >
                  Join FanZone
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden text-(--color-line) p-2"
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <nav className="md:hidden flex flex-col gap-4 pb-6 pt-2 border-t border-(--color-gold)/20">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}

            {currentUser && role === "fan" && (
              <NavLink to="/dashboard" className="text-sm font-semibold uppercase tracking-wide text-(--color-gold)" onClick={() => setOpen(false)}>
                My Fanzone
              </NavLink>
            )}
            {currentUser && role === "admin" && (
              <NavLink to="/admin" className="text-sm font-semibold uppercase tracking-wide text-red-400" onClick={() => setOpen(false)}>
                Admin Console
              </NavLink>
            )}
            <div className="flex gap-3 pt-2">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold uppercase tracking-wide text-red-400"
                >
                  Log Out
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLoginRedirect}
                    className="text-sm font-semibold uppercase tracking-wide text-(--color-line)/80"
                  >
                    Log in
                  </button>
                  <button
                    onClick={handleRegisterRedirect}
                    className="rounded-sm bg-(--color-kit) px-4 py-2 text-sm font-semibold uppercase tracking-wide text-(--color-line)"
                  >
                    Join FanZone
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
