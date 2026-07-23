import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

const FRIENDLY_ERRORS = {
  "auth/invalid-email": "That email address doesn't look right.",
  "auth/user-not-found": "No account found with that email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Network error — check your internet connection.",
  "auth/operation-not-allowed": "Email/Password sign-in isn't enabled for this project yet (Firebase Console → Authentication → Sign-in method)."
};

export default function Login() {
  const { currentUser, role, loading, loginWithEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && currentUser && role) {
      const dest = role === "admin" ? "/admin" : "/dashboard";
      navigate(location.state?.from?.pathname || dest, { replace: true });
    }
  }, [currentUser, role, loading]); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { role: resolvedRole } = await loginWithEmail(email.trim(), password);
      navigate(resolvedRole === "admin" ? "/admin" : "/dashboard", { replace: true });
    } catch (err) {
      console.error("Login failed:", err.code || err.message, err);
      setError(FRIENDLY_ERRORS[err.code] || `Something went wrong (${err.code || err.message || "unknown error"}).`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-(--color-concrete) px-4">
      <div className="w-full max-w-sm rounded-md bg-white p-8 shadow-xl">
        <div className="text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-(--color-kit)">
            Chattogram Titans Fanzone
          </span>
          <h1 className="mt-2 font-(family-name:--font-display) text-3xl text-(--color-pitch)">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-(--color-ink)/60">
            Fans and club admin both log in here.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink)/60">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-sm border border-(--color-ink)/15 px-3 py-2.5 text-sm outline-none focus:border-(--color-gold) focus:ring-2 focus:ring-(--color-gold)/25"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-wide text-(--color-ink)/60">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-sm border border-(--color-ink)/15 px-3 py-2.5 text-sm outline-none focus:border-(--color-gold) focus:ring-2 focus:ring-(--color-gold)/25"
              placeholder="********"
            />
          </div>

          {error && <p className="rounded-sm bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 rounded-sm bg-(--color-kit) px-4 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-(--color-kit-dark) disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--color-ink)/60">
          New here?{" "}
          <Link to="/register" className="font-semibold text-(--color-kit) hover:text-(--color-kit-dark)">
            Join Fanzone
          </Link>
        </p>
      </div>
    </div>
  );
}
